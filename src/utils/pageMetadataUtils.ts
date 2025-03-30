import { Page, ElementHandle } from 'puppeteer';
import { logger } from './logger';
import sharp from 'sharp'; // Import the sharp library for image processing

export interface FormElementInfo {
  tagName: string | null;
  attributes: Record<string, string>;
  type?: string | null; // For input elements
  name?: string | null; // For form elements
  value?: string | null; // For input/textarea/select
}

export interface PageMetadata {
  clickableElementsInfo: string; // Changed to string
  formElementsInfo: string; // Changed to string
  domSnapshot: string;
  totalClickableElementCount: number;
  totalFormElementCount: number;
  screenshotBase64?: string; // Optional: base64 encoded screenshot
}

async function compressBase64Image(base64String: string | undefined, quality: number = 80): Promise<string | undefined> {
  if (!base64String) {
    logger.warn('Attempted to compress an undefined base64 string.');
    return undefined;
  }
  try {
    const base64Data = base64String.split(',')[1]; // Remove data URL prefix
    if (!base64Data) {
      logger.warn('Invalid base64 string format (missing comma).');
      return base64String; // Return the original or handle as error
    }
    const buffer = Buffer.from(base64Data, 'base64');

    const compressedBuffer = await sharp(buffer)
      .jpeg({ quality }) // Use JPEG with specified quality for lossy compression
      .toBuffer();

    return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
  } catch (error) {
    logger.error('Error compressing base64 image:', error);
    return undefined;
  }
}

export async function getPageMetadata(page: Page, includeScreenshot: boolean = false): Promise<PageMetadata | null> {
  let screenshotBase64: string | undefined;

  if (includeScreenshot) {
    try {
      const rawScreenshot = await page.screenshot({ encoding: 'base64' });
      screenshotBase64 = await compressBase64Image(rawScreenshot, 70); // Compress with 70% quality
    } catch (screenshotError) {
      logger.error('Error taking or compressing screenshot:', screenshotError);
    }
  }

  try {
    const metadata = await page.evaluate(async () => {
      const clonedDocument = document.documentElement.cloneNode(true) as HTMLElement;

      // Function to remove unnecessary elements from the cloned DOM
      function removeUnnecessary(root: HTMLElement) {
        const scriptElements = root.querySelectorAll('script');
        scriptElements.forEach(script => script.remove());

        const styleElements = root.querySelectorAll('style');
        styleElements.forEach(style => style.remove());

        const linkElements = root.querySelectorAll('link[rel="stylesheet"]');
        linkElements.forEach(link => link.remove());

        const commentNodes = document.createTreeWalker(
          root,
          NodeFilter.SHOW_COMMENT,
          null
        );
        let comment;
        while ((comment = commentNodes.nextNode())) {
          comment.parentNode?.removeChild(comment);
        }
      }

      removeUnnecessary(clonedDocument);

      const clickableElements: HTMLElement[] = Array.from(clonedDocument.querySelectorAll('button, a[href], input[type="submit"], input[type="button"], [onclick]'));
      const clickableElementsInfo: { tagName: string | null; attributes: Record<string, string> }[] = clickableElements.map(el => ({
        tagName: el.tagName,
        attributes: Object.fromEntries(Array.from(el.attributes).map(attr => [attr.name, attr.value])),
      }));

      const formElements: HTMLElement[] = Array.from(clonedDocument.querySelectorAll('input, textarea, select, form'));
      const formElementsInfo: { tagName: string | null; attributes: Record<string, string>; type?: string | null; name?: string | null; value?: string | null }[] = formElements.map(el => ({
        tagName: el.tagName,
        attributes: Object.fromEntries(Array.from(el.attributes).map(attr => [attr.name, attr.value])),
        type: (el as HTMLInputElement)?.type || (el as HTMLTextAreaElement)?.type || (el as HTMLSelectElement)?.type || null,
        name: (el as HTMLInputElement)?.name || (el as HTMLTextAreaElement)?.name || (el as HTMLSelectElement)?.name || (el as HTMLFormElement)?.name || null,
        value: (el as HTMLInputElement)?.value || (el as HTMLTextAreaElement)?.value || (el as HTMLSelectElement)?.value || null,
      }));

      return {
        clickableElementsInfo: JSON.stringify(clickableElementsInfo), // Stringify here
        formElementsInfo: JSON.stringify(formElementsInfo), // Stringify here
        domSnapshot: clonedDocument.outerHTML,
        totalClickableElementCount: clickableElementsInfo.length,
        totalFormElementCount: formElementsInfo.length,
      };
    });

    return {
      ...metadata,
      screenshotBase64,
    };
  } catch (error) {
    logger.error('Error getting page metadata:', error);
    return null;
  }
}