import{amethyst,aquaBlue,atomDark,cobalt2,cyberpunk,dracula,freeCodeCampDark,githubLight,levelUp,monokaiPro,neoCyan,nightOwl,sandpackDark}from"http://localhost:8081/_mirror/framerusercontent.com/modules/c4BjG1nmVImY1EzTuV13/KZG8I4o0IAC43nXri4el/codesandbox_sandpack_themes.js";import{isObject,isDarkColor}from"http://localhost:8081/_mirror/framerusercontent.com/modules/IdMJ4CymCWCh4cOBkZlb/JaBD733GrAZQYolmaTcm/utils.js";import{clampRGB}from"framer";const magic={colors:{surface1:"#f6f6f8",surface2:"#f6f6f8",surface3:"#f6f6f8",clickable:"#808080",base:"#323232",disabled:"#C5C5C5",hover:"#4D4D4D",accent:"#ffa600",error:"#ff453a",errorSurface:"#ffeceb"},syntax:{plain:"#151515",comment:{color:"#cacacd",fontStyle:"italic"},keyword:"#ffa600",tag:"#ff9a4d",punctuation:"#ffb3b3",definition:"#ff6f00",property:"#9900ff",static:"#FF453A",string:"#f53524"},font:{body:'"Roboto Mono", monospace',mono:'"Roboto Mono", monospace',size:"14px",lineHeight:"24px"}};const atomLight={colors:{surface1:"#fafafa"},syntax:{plain:"#383a42",comment:{color:"#a0a1a7",fontStyle:"italic"},keyword:"#a626a4",tag:"#e45649",punctuation:"#383a42",definition:"#c18401",property:"#4078f2",static:"#986801",string:"#50a14f"}};const framerLight={colors:{surface1:"#fafafa",surface2:"#eeeeee",surface3:"#f3f3f3",clickable:"#808080",base:"#323232",disabled:"#c5c5c5",hover:"#4d4d4d",accent:"#0099ff",error:"#ff3366",errorSurface:"#ffe0e8"},syntax:{plain:"#666666",comment:{color:"#bbbbbb",fontStyle:"italic"},keyword:"#0099ff",tag:"#0099ff",punctuation:"#bbbbbb",definition:"#FFAA00",property:"#33cccc",static:"#ff8866",string:"#8855ff"}};const framerDark={colors:{surface1:"#161820",surface2:"#252525",surface3:"#2f2f2f",clickable:"#999999",base:"#d92121",disabled:"#4d4d4d",hover:"#c5c5c5",accent:"#0099ff",error:"#ff3366",errorSurface:"#ffe0e8"},syntax:{plain:"#eeeeee",comment:{color:"#666666",fontStyle:"italic"},keyword:"#00BBFF",tag:"#00BBFF",punctuation:"#999999",definition:"#ffcc66",property:"#77dddd",static:"#ff8866",string:"#bb88ff"}};const ayuLight={colors:{surface1:"#fafafa"},syntax:{comment:{color:"aaaeb1",fontStyle:"italic"},definition:"#3b9ee6",keyword:"#fa8e3e",plain:"#5c6166",property:"#f2ae49",punctuation:"#5c6167",static:"#a37acc",string:"#87b300",tag:"#56b4d5"}};const ayuDark={colors:{surface1:"#0c1017"},syntax:{comment:{color:"#646a72",fontStyle:"italic"},definition:"#5ac2ff",keyword:"#ff9040",plain:"#bfbdb6",property:"#ffb454",punctuation:"#bfbdb6",static:"#d2a6ff",string:"#80d962",tag:"#3bbae7"}};const sandpackLight={colors:{surface1:"#ffffff",surface2:"#EFEFEF",surface3:"#F3F3F3",disabled:"#C5C5C5",base:"#323232",clickable:"#808080",hover:"#4D4D4D",accent:"#3973E0",error:"#EA3323",errorSurface:"#FCF1F0",warning:"#6A4516",warningSurface:"#FEF2C0"},syntax:{plain:"#151515",comment:{color:"#999",fontStyle:"italic"},keyword:"#7C5AE3",tag:"#0971F1",punctuation:"#3B3B3B",definition:"#85A600",property:"#3B3B3B",static:"#3B3B3B",string:"#2E6BD0"}};const githubDark={colors:{...framerDark.colors,surface1:"#0d1117"},syntax:{comment:{color:"#8b949e",fontStyle:"italic"},definition:"#d2a8ff",keyword:"#ff7b72",plain:"#e6edf3",property:"#79c0ff",punctuation:"#e6edf3",static:"#7ee787",string:"#a5d6ff",tag:"#7ee787"}};// A bit verbose but helps keep our themes in check
export const themeKeys=["amethyst","aquaBlue","atomDark","atomLight","ayuDark","ayuLight","cobalt2","cyberpunk","dracula","framerDark","framerLight","freeCodeCamp","githubDark","githubLight","levelUp","monokaiPro","magic","neoCyan","nightOwl","sandpackDark","sandpackLight"];export const themes={amethyst,aquaBlue,atomDark,atomLight,ayuDark,ayuLight,cobalt2,cyberpunk,dracula,framerDark,framerLight,freeCodeCamp:freeCodeCampDark,githubDark,githubLight,levelUp,monokaiPro,magic,neoCyan,nightOwl,sandpackDark,sandpackLight};export const lightThemeVariables=`
/* Colors */
--cb-colors-surface1: var(--cb-colors-surface1-light);
--cb-colors-surface2: var(--cb-colors-surface2-light);
--cb-colors-surface3: var(--cb-colors-surface3-light);
--cb-colors-disabled: var(--cb-colors-disabled-light);
--cb-colors-base: var(--cb-colors-base-light);
--cb-colors-clickable: var(--cb-colors-clickable-light);
--cb-colors-hover: var(--cb-colors-hover-light);
--cb-colors-accent: var(--cb-colors-accent-light);
--cb-colors-error: var(--cb-colors-error-light);
--cb-colors-errorSurface: var(--cb-colors-errorSurface-light);
--cb-colors-warning: var(--cb-colors-warning-light);
--cb-colors-warningSurface: var(--cb-colors-warningSurface-light);

/* Syntax */
--cb-syntax-color-plain: var(--cb-syntax-color-plain-light);
--cb-syntax-color-comment: var(--cb-syntax-color-comment-light);
--cb-syntax-color-keyword: var(--cb-syntax-color-keyword-light);
--cb-syntax-color-definition: var(--cb-syntax-color-definition-light);
--cb-syntax-color-punctuation: var(--cb-syntax-color-punctuation-light);
--cb-syntax-color-property: var(--cb-syntax-color-property-light);
--cb-syntax-color-tag: var(--cb-syntax-color-tag-light);
--cb-syntax-color-static: var(--cb-syntax-color-static-light);
--cb-syntax-color-string: var(--cb-syntax-color-string-light);

/* Other */
--cb-color-scheme: var(--cb-color-scheme-light);
`;export const darkThemeVariables=`
/* Colors */
--cb-colors-surface1: var(--cb-colors-surface1-dark);
--cb-colors-surface2: var(--cb-colors-surface2-dark);
--cb-colors-surface3: var(--cb-colors-surface3-dark);
--cb-colors-disabled: var(--cb-colors-disabled-dark);
--cb-colors-base: var(--cb-colors-base-dark);
--cb-colors-clickable: var(--cb-colors-clickable-dark);
--cb-colors-hover: var(--cb-colors-hover-dark);
--cb-colors-accent: var(--cb-colors-accent-dark);
--cb-colors-error: var(--cb-colors-error-dark);
--cb-colors-errorSurface: var(--cb-colors-errorSurface-dark);
--cb-colors-warning: var(--cb-colors-warning-dark);
--cb-colors-warningSurface: var(--cb-colors-warningSurface-dark);

/* Syntax */
--cb-syntax-color-plain: var(--cb-syntax-color-plain-dark);
--cb-syntax-color-comment: var(--cb-syntax-color-comment-dark);
--cb-syntax-color-keyword: var(--cb-syntax-color-keyword-dark);
--cb-syntax-color-definition: var(--cb-syntax-color-definition-dark);
--cb-syntax-color-punctuation: var(--cb-syntax-color-punctuation-dark);
--cb-syntax-color-property: var(--cb-syntax-color-property-dark);
--cb-syntax-color-tag: var(--cb-syntax-color-tag-dark);
--cb-syntax-color-static: var(--cb-syntax-color-static-dark);
--cb-syntax-color-string: var(--cb-syntax-color-string-dark);

/* Other */
--cb-color-scheme: var(--cb-color-scheme-dark);
`;export function getVariableTheme(font){return{colors:{surface1:"var(--cb-colors-surface1)",surface2:"var(--cb-colors-surface2)",surface3:"var(--cb-colors-surface3)",disabled:"var(--cb-colors-disabled)",base:"var(--cb-colors-base)",clickable:"var(--cb-colors-clickable)",hover:"var(--cb-colors-hover)",accent:"var(--cb-colors-accent)",error:"var(--cb-colors-error)",errorSurface:"var(--cb-colors-errorSurface)",warning:"var(--cb-colors-warning)",warningSurface:"var(--cb-colors-warningSurface)"},syntax:{plain:{color:"var(--cb-syntax-color-plain)"},comment:{color:"var(--cb-syntax-color-comment)"},keyword:{color:"var(--cb-syntax-color-keyword)"},definition:{color:"var(--cb-syntax-color-definition)"},punctuation:{color:"var(--cb-syntax-color-punctuation)"},property:{color:"var(--cb-syntax-color-property)"},tag:{color:"var(--cb-syntax-color-tag)"},static:{color:"var(--cb-syntax-color-static)"},string:{color:"var(--cb-syntax-color-string)"}},font:{body:"sans-serif",mono:font.fontFamily??"monospace",size:font.fontSize,lineHeight:font.lineHeight}};}export function getVariablesForTheme(theme,background,mode){const result={};const{colors,syntax}=themes[theme]||{};// Collect all colors and turn them into CSS variables.
if(isObject(colors)){for(const name in colors){const value=colors[name];result[`--cb-colors-${name}-${mode}`]=value;}}// Collect all syntax colors and turn them into CSS variables.
if(isObject(syntax)){for(const name in syntax){const value=syntax[name];if(isObject(value)){for(const style in value){result[`--cb-syntax-${style}-${name}-${mode}`]=value[style];}}else{result[`--cb-syntax-color-${name}-${mode}`]=value;}}}// Override the background color.
if(background){result[`--cb-colors-surface1-${mode}`]=`var(--cb-custom-background, ${background})`;result["--cb-background-rgb"]=clampRGB(background);}else{background=result[`--cb-colors-surface1-${mode}`];}// This is important to show scrollbars and selections with the correct color.
result[`--cb-color-scheme-${mode}`]=isDarkColor(background)?"dark":"light";return result;}
export const __FramerMetadata__ = {"exports":{"ThemeKeys":{"type":"tsType","annotations":{"framerContractVersion":"1"}},"lightThemeVariables":{"type":"variable","annotations":{"framerContractVersion":"1"}},"getVariablesForTheme":{"type":"function","annotations":{"framerContractVersion":"1"}},"themeKeys":{"type":"variable","annotations":{"framerContractVersion":"1"}},"themes":{"type":"variable","annotations":{"framerContractVersion":"1"}},"getVariableTheme":{"type":"function","annotations":{"framerContractVersion":"1"}},"darkThemeVariables":{"type":"variable","annotations":{"framerContractVersion":"1"}},"__FramerMetadata__":{"type":"variable"}}}