import{t as e}from"./rolldown-runtime.Bi-D_2cA.mjs";import{D as t,U as n,V as r,b as i,c as a,s as o,v as s,x as c}from"./react.C-sCSfvK.mjs";import{P as l,c as u,et as d}from"./framer.BihoG2Tf.mjs";import{h as f,o as p,p as m,t as h}from"./OIjZRBmWDcIE2B6qgG1j.MviEnrF1.mjs";function g(){return(g=e((()=>{h()})))()}function _({type:e,url:t,html:n,zoom:r,radius:i,border:a,style:s={}}){return e===`url`&&t?/*#__PURE__*/ o(y,{url:t,zoom:r,radius:i,border:a,style:s}):e===`html`&&n?/*#__PURE__*/ o(x,{html:n,style:s}):/*#__PURE__*/ o(v,{style:s})}function v({style:e}){return/*#__PURE__*/ o(`div`,{style:{minHeight:O(e),...f,overflow:`hidden`,...e},children:/*#__PURE__*/ o(`div`,{style:j,children:`To embed a website or widget, add it to the properties\xA0panel.`})})}function y({url:e,zoom:t,radius:n,border:r,style:a}){let c=!a.height;/[a-z]+:\/\//.test(e)||(e=`https://`+e);let l=p(),[u,d]=s(l?void 0:!1);if(i(()=>{if(!l)return;let t=!0;d(void 0);async function n(){let n=await fetch(`http://localhost:8081/_blocked/api.framer.com/functions/check-iframe-url?url=`+encodeURIComponent(e));if(n.status==200){let{isBlocked:e}=await n.json();t&&d(e)}else{let e=await n.text();console.error(e),d(/* @__PURE__ */ Error(`This site can’t be reached.`))}}return n().catch(e=>{console.error(e),d(e)}),()=>{t=!1}},[e]),l&&c)return/*#__PURE__*/ o(D,{message:`URL embeds do not support auto height.`,style:a});if(!e.startsWith(`https://`))return/*#__PURE__*/ o(D,{message:`Unsupported protocol.`,style:a});if(u===void 0)return/*#__PURE__*/ o(E,{});if(u instanceof Error)return/*#__PURE__*/ o(D,{message:u.message,style:a});if(u===!0){let t=`Can’t embed ${e} due to its content security policy.`;return/*#__PURE__*/ o(D,{message:t,style:a})}return/*#__PURE__*/ o(`iframe`,{src:e,style:{...k,...a,...r,zoom:t,borderRadius:n,transformOrigin:`top center`},loading:`lazy`,fetchPriority:l?`low`:`auto`,referrerPolicy:`no-referrer`,sandbox:b(l)})}function b(e){let t=[`allow-same-origin`,`allow-scripts`];return e||t.push(`allow-downloads`,`allow-forms`,`allow-modals`,`allow-orientation-lock`,`allow-pointer-lock`,`allow-popups`,`allow-popups-to-escape-sandbox`,`allow-presentation`,`allow-storage-access-by-user-activation`,`allow-top-navigation-by-user-activation`),t.join(` `)}function x({html:e,...t}){if(e.includes(`<\/script>`)){let n=e.includes(`</spline-viewer>`),r=e.includes(`<!-- framer-direct-embed -->`);return o(n||r?C:S,{html:e,...t})}return/*#__PURE__*/ o(w,{html:e,...t})}function S({html:e,style:t}){let r=c(),[a,l]=s(0);i(()=>{let e=r.current?.contentWindow;function t(t){if(t.source!==e)return;let n=t.data;if(typeof n!=`object`||!n)return;let r=n.embedHeight;typeof r==`number`&&l(r)}return n.addEventListener(`message`,t),e?.postMessage(`getEmbedHeight`,`*`),()=>{n.removeEventListener(`message`,t)}},[]);let u=`
<html>
    <head>
        <style>
            html, body {
                margin: 0;
                padding: 0;
            }

            body {
                display: flex;
                justify-content: center;
                align-items: center;
            }

            :root {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            * {
                box-sizing: border-box;
                -webkit-font-smoothing: inherit;
            }

            h1, h2, h3, h4, h5, h6, p, figure {
                margin: 0;
            }

            body, input, textarea, select, button {
                font-size: 12px;
                font-family: sans-serif;
            }
        </style>
    </head>
    <body>
        ${e}
        <script type="module">
            let height = 0

            function sendEmbedHeight() {
                window.parent.postMessage({
                    embedHeight: height
                }, "*")
            }

            const observer = new ResizeObserver((entries) => {
                if (entries.length !== 1) return
                const entry = entries[0]
                if (entry.target !== document.body) return

                height = entry.contentRect.height
                sendEmbedHeight()
            })

            observer.observe(document.body)

            window.addEventListener("message", (event) => {
                if (event.source !== window.parent) return
                if (event.data !== "getEmbedHeight") return
                sendEmbedHeight()
            })
        <\/script>
    <body>
</html>
`,d={...k,...t};return t.height||(d.height=a+`px`),/*#__PURE__*/ o(`iframe`,{ref:r,style:d,srcDoc:u})}function C({html:e,style:t}){let n=c();return i(()=>{let t=n.current;if(t)return t.innerHTML=e,T(t),()=>{t.innerHTML=``}},[e]),/*#__PURE__*/ o(`div`,{ref:n,style:{...A,...t}})}function w({html:e,style:t}){return/*#__PURE__*/ o(`div`,{style:{...A,...t},dangerouslySetInnerHTML:{__html:e}})}function T(e){if(e instanceof Element&&e.tagName===`SCRIPT`){let t=document.createElement(`script`);t.text=e.innerHTML;for(let{name:n,value:r}of e.attributes)t.setAttribute(n,r);e.parentElement.replaceChild(t,e)}else for(let t of e.childNodes)T(t)}function E(){return/*#__PURE__*/ o(`div`,{className:`framerInternalUI-componentPlaceholder`,style:{...m,overflow:`hidden`},children:/*#__PURE__*/ o(`div`,{style:j,children:`Loading…`})})}function D({message:e,style:t}){return/*#__PURE__*/ o(`div`,{className:`framerInternalUI-errorPlaceholder`,style:{minHeight:O(t),...m,overflow:`hidden`,...t},children:/*#__PURE__*/ o(`div`,{style:j,children:e})})}function O(e){if(!e.height)return 200}var k,A,j;function M(){return(M=e((()=>{r(),a(),t(),d(),g(),l(_,{type:{type:u.Enum,defaultValue:`url`,displaySegmentedControl:!0,options:[`url`,`html`],optionTitles:[`URL`,`HTML`]},url:{title:`URL`,type:u.String,description:`Some websites don’t support embedding.`,hidden(e){return e.type!==`url`}},html:{title:`HTML`,type:u.String,displayTextArea:!0,hidden(e){return e.type!==`html`}},border:{title:`Border`,type:u.Border,optional:!0,hidden(e){return e.type!==`url`}},radius:{type:u.BorderRadius,title:`Radius`,hidden(e){return e.type!==`url`}},zoom:{title:`Zoom`,defaultValue:1,type:u.Number,hidden(e){return e.type!==`url`},min:.1,max:1,step:.1,displayStepper:!0}}),k={width:`100%`,height:`100%`,border:`none`},A={width:`100%`,height:`100%`,display:`flex`,flexDirection:`column`,justifyContent:`center`,alignItems:`center`},j={textAlign:`center`,minWidth:140}})))()}export{M as n,_ as t};
//# sourceMappingURL=Embed.DFhQTPoJ.mjs.map