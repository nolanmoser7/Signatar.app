import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
// @ts-ignore - No types available for gifencoder
import GIFEncoder from 'gifencoder';
import type { Signature, PersonalInfo, SocialMedia, Images, ElementAnimations } from '@shared/schema';

interface ExportResult {
  finalHtml: string;
  gifUrls: { [elementId: string]: string };
}
