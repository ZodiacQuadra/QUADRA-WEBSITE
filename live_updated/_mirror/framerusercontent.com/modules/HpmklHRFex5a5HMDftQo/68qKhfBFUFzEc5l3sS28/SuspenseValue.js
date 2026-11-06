function _define_property(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}export class SuspenseValue{read(){const status=this.status;// The component did rerender and we already set the status below.
if(status){switch(status.type){// If the promise is still pending we need to suspend again.
case"pending":throw status.promise;// If the promise is fulfilled we can return the value
// synchronously.
case"fulfilled":return status.value;// If the promise was rejected we can throw the error so we can
// catch it with an ErrorBoundary in an ancestor.
case"rejected":throw status.reason;}}// Attach a callback to the promise to store the resolved value or the error
// on the promise so we can synchronously read it later.
const promise=this.resolver().then(value=>{this.status={type:"fulfilled",value};},reason=>{this.status={type:"rejected",reason};});// This is the first time the promise is passed into the function. We set
// the status field so we can early return above.
this.status={type:"pending",promise};// We throw the promise to suspend rendering. React will wait until the
// promise is settled and rerender the component afterwards. When React
// rerenders the component we can return the value in the code above.
throw promise;}constructor(resolver){_define_property(this,"resolver",void 0);_define_property(this,"status",void 0);this.resolver=resolver;}}
export const __FramerMetadata__ = {"exports":{"SuspenseValue":{"type":"class","annotations":{"framerContractVersion":"1"}},"__FramerMetadata__":{"type":"variable"}}}
//# sourceMappingURL=./SuspenseValue.map