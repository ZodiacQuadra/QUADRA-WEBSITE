import{jsx as _jsx,jsxs as _jsxs}from"react/jsx-runtime";import{motion}from"framer-motion";import{getSandpackCssText,SandpackCodeEditor,SandpackLayout,SandpackProvider}from"http://localhost:8081/_mirror/framerusercontent.com/modules/SWAtenub3goqbKHfvwGg/9qswdehoMhlafVrcNUjB/codesandbox_sandpack_react.js";import{addPropertyControls,ControlType,withCSS}from"framer";import{supportedLanguages}from"http://localhost:8081/_mirror/framerusercontent.com/modules/19BkzxjVBT3VP0Ykl3DY/RGqU3tpLfAWuPhUCcIcu/types.js";import{useLanguageAsync}from"http://localhost:8081/_mirror/framerusercontent.com/modules/DyzTKdNCsRH8nvz08sNT/FhxKfBfHDeWuioZyUwlM/useLanguageAsync.js";import{getFileExtensions,titleCase,useBorder,useIsOnCanvas,usePadding,useRadius}from"http://localhost:8081/_mirror/framerusercontent.com/modules/IdMJ4CymCWCh4cOBkZlb/JaBD733GrAZQYolmaTcm/utils.js";import{darkThemeVariables,getVariablesForTheme,getVariableTheme,lightThemeVariables,themeKeys}from"http://localhost:8081/_mirror/framerusercontent.com/modules/HdJmYu90NFzknVhsFw9C/YPaaRBOrJRLoPp3owbzS/theming.js";const DEFAULT_CODE=`// Paste a code snippet
import { motion } from "framer-motion";

function Component() {
    return (
        <motion.div
            transition={{ ease: "linear" }}
            animate={{ rotate: 360, scale: 2 }}
        />
    );
}`;const wrapperClassName="framer-cb";const css=[`
.${wrapperClassName} .sp-pre-placeholder {
    padding: var(--cb-padding) !important;
    padding-left: calc(var(--cb-padding) + var(--sp-space-1, 0)) !important;
    margin: 0 !important;
    width: max-content;
}
    `,`
.${wrapperClassName} .cm-scroller {
    display: unset !important;
    padding: 0 !important;
}
    `,`
.${wrapperClassName} .cm-content {
    padding: var(--cb-padding) !important;
    width: max-content;
}
    `,`
.${wrapperClassName} .sp-wrapper {
    color-scheme: var(--cb-color-scheme, inherit);
}
    `,// This override rules to fix font-size on mobile safari.
// .cm-content is rendered with js enabled
// .sp-pre-placeholder is rendered in no-js mode (SSG output)
`
@media screen and (max-width: 768px) {
    @supports (-webkit-overflow-scrolling: touch) {
        .cb-code-editor .cm-content,
        .cb-code-editor .sp-pre-placeholder {
            font-size: var(--sp-font-size, inherit);
            -webkit-text-size-adjust: 100%;
        }
    }
}
`,// Override the 50% height on small screens
`
@media screen and (max-width: 768px) {
    .${wrapperClassName} .sp-editor-viewer.sp-stack {
        height: 100%;
    }
}
`,// Light mode
`
.${wrapperClassName} {
    ${lightThemeVariables}
}
    `,`
body[data-framer-theme="dark"] .${wrapperClassName} {
    ${darkThemeVariables}
}
    `,`
@media (prefers-color-scheme: dark) {
    body:not([data-framer-theme]) .${wrapperClassName} {
        ${darkThemeVariables}
    }
}
    `,`
@supports not (color: color(display-p3 1 1 1)) {
    :root {
        --cb-custom-background: var(--cb-background-rgb)
    }
}
    `].map(rule=>rule.trim());/**
 * Code Block
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight any
 *
 * @framerDisableUnlink
 *
 * @framerIntrinsicWidth 500
 * @framerIntrinsicHeight 200
 *
 * @framerComponentPresetProps borderRadius, border, font, themeMode, theme, lightTheme, darkTheme, background, padding
 */const CodeBlock=withCSS(function CodeBlock(props){const{code,themeMode,theme,lightTheme,darkTheme,style,language,font,border,background}=props;const variableTheme=getVariableTheme(font);const lightThemeVariables=getVariablesForTheme(themeMode==="Dynamic"?lightTheme:theme,background,"light");const darkThemeVariables=getVariablesForTheme(themeMode==="Dynamic"?darkTheme:theme,background,"dark");// async version
const additionalLanguage=useLanguageAsync(language);// sync version
// const additionalLanguage = getLanguage(language)
const extension=getFileExtensions(language)[0];const onCanvas=useIsOnCanvas();const borderStyles=useBorder(border||{},false);const borderRadius=useRadius(props);const hasBorderRadius=borderRadius!=="0px 0px 0px 0px"&&borderRadius!=="0px";const fileName=`example.${extension}`;const padding=usePadding(props);return /*#__PURE__*/_jsx(motion.div,{className:wrapperClassName,whileHover:"visible",style:{...lightThemeVariables,...darkThemeVariables,position:"relative",width:"100%",height:"100%"},children:/*#__PURE__*/_jsx(SandpackProvider,{options:{classes:{"sp-code-editor":"cb-code-editor"}},theme:variableTheme,files:{[fileName]:code},customSetup:{entry:fileName},style:{height:"100%"},children:/*#__PURE__*/_jsxs(SandpackLayout,{style:{height:"100%",// make sure the codeblock doesnt grow beyond
// the height of its contents
"--sp-layout-height":"100%",// set the variables for padding we use in the overrides
"--cb-padding":`${padding}`,...borderStyles,// match editor background color to make borders visually blend with the editor:
backgroundColor:"var(--sp-colors-surface1)",borderRadius,transform:// Safari sometimes struggles to render border-radius:
// - on the canvas when changing from 0 to any other value
// - or when rendering an iframe
hasBorderRadius&&onCanvas?"translateZ(0.000001px)":"unset",overflow:"hidden"},children:[/*#__PURE__*/_jsx(SandpackCodeEditor,{style:{letterSpacing:font.letterSpacing,fontStyle:font.fontStyle,fontWeight:font.fontWeight},readOnly:true,showReadOnly:false,additionalLanguages:additionalLanguage?[additionalLanguage]:undefined}),/*#__PURE__*/_jsx(SandpackStyles,{})]})})});},css,"framer-lib-codeblock");export default CodeBlock;function SandpackStyles(){return /*#__PURE__*/_jsx("div",{style:{display:"contents"},// This makes it so we load the CSS only once. If we were to SSR it per code-block, we could end up with multiple times the big Sandpack CSS on one page, which is more wasteful than just hoisting to the <head>. It gets de-duped during SSG.
"data-framer-css-ssr":true,suppressHydrationWarning:true,// We wrap it like this because during SSG the style tag will be moved to the <head>. But during CSR we need to render it again.
dangerouslySetInnerHTML:{__html:"<style>"+getSandpackCssText()+"</style>"}});}const themeNames=themeKeys.map(titleCase);addPropertyControls(CodeBlock,{code:{type:ControlType.String,title:"Code",displayTextArea:true,defaultValue:DEFAULT_CODE},themeMode:{type:ControlType.Enum,title:"Theme",displaySegmentedControl:true,options:["Static","Dynamic"],defaultValue:"Static"},theme:{type:ControlType.Enum,title:" ",options:[...themeKeys],optionTitles:themeNames,defaultValue:"framerDark",hidden:({themeMode})=>themeMode!=="Static"},lightTheme:{type:ControlType.Enum,title:"Light",options:[...themeKeys],optionTitles:themeNames,defaultValue:"framerLight",hidden:({themeMode})=>themeMode!=="Dynamic"},darkTheme:{type:ControlType.Enum,title:"Dark",options:[...themeKeys],optionTitles:themeNames,defaultValue:"framerDark",hidden:({themeMode})=>themeMode!=="Dynamic"},language:{type:ControlType.Enum,title:"Language",options:[...supportedLanguages],defaultValue:"JSX"},font:{// @ts-ignore: Internal API
type:ControlType.Font,controls:"extended",displayFontSize:true,displayTextAlignment:false,defaultFontType:"monospace",defaultValue:{fontSize:14,lineHeight:"1.5em"}},background:{title:"Fill",type:ControlType.Color,optional:true},border:{type:ControlType.Border,optional:true},borderRadius:{title:"Radius",type:ControlType.FusedNumber,toggleKey:"isMixedBorderRadius",toggleTitles:["Radius","Radius per corner"],valueKeys:["topLeftRadius","topRightRadius","bottomRightRadius","bottomLeftRadius"],valueLabels:["TL","TR","BR","BL"],min:0,defaultValue:15},padding:{title:"Padding",type:ControlType.FusedNumber,toggleKey:"paddingPerSide",toggleTitles:["Padding","Padding per side"],valueKeys:["paddingTop","paddingRight","paddingBottom","paddingLeft"],valueLabels:["T","R","B","L"],min:0,defaultValue:30}});CodeBlock.displayName="Code Block";
export const __FramerMetadata__ = {"exports":{"default":{"type":"reactComponent","name":"CodeBlock","slots":[],"annotations":{"framerContractVersion":"1","framerComponentPresetProps":"borderRadius, border, font, themeMode, theme, lightTheme, darkTheme, background, padding","framerIntrinsicHeight":"200","framerSupportedLayoutHeight":"any","framerDisableUnlink":"*","framerSupportedLayoutWidth":"fixed","framerIntrinsicWidth":"500"}},"__FramerMetadata__":{"type":"variable"}}}
//# sourceMappingURL=./CodeBlock.map