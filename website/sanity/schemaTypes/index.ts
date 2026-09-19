import { authorType } from "./author";
import { blogCategoryType } from "./blogCategory";
import { blogPostType } from "./blogPost";
import { footerType } from "./footer";
import { homePageType } from "./homePage";
import { navigationType } from "./navigation";
import { pageType } from "./page";
import { seoType } from "./seo";
import { siteSettingsType } from "./siteSettings";

export const schemaTypes = [siteSettingsType, navigationType, footerType, homePageType, pageType, blogPostType, blogCategoryType, authorType, seoType];
