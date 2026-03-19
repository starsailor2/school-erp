var It=Object.defineProperty;var Bt=(t,e,n)=>e in t?It(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var Y=(t,e,n)=>Bt(t,typeof e!="symbol"?e+"":e,n);import{r as l,a as jt,F as X,_ as Dt,c as x,j as N,b as ct,G as et}from"./index-C6TQyhfI.js";import{a as pt,s as nt,g as Lt,b as J,c as vt,f as Nt,h as Ot,j as kt}from"./Box-6RA3i4QJ.js";function G(t){const e=l.useRef(t);return jt(()=>{e.current=t}),l.useRef((...n)=>(0,e.current)(...n)).current}function Ft(t,e){if(t==null)return{};var n={};for(var i in t)if({}.hasOwnProperty.call(t,i)){if(e.indexOf(i)!==-1)continue;n[i]=t[i]}return n}function Q(t,e){return Q=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(n,i){return n.__proto__=i,n},Q(t,e)}function $t(t,e){t.prototype=Object.create(e.prototype),t.prototype.constructor=t,Q(t,e)}const at=X.createContext(null);function Ut(t){if(t===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function ot(t,e){var n=function(r){return e&&l.isValidElement(r)?e(r):r},i=Object.create(null);return t&&l.Children.map(t,function(o){return o}).forEach(function(o){i[o.key]=n(o)}),i}function zt(t,e){t=t||{},e=e||{};function n(h){return h in e?e[h]:t[h]}var i=Object.create(null),o=[];for(var r in t)r in e?o.length&&(i[r]=o,o=[]):o.push(r);var s,c={};for(var u in e){if(i[u])for(s=0;s<i[u].length;s++){var f=i[u][s];c[i[u][s]]=n(f)}c[u]=n(u)}for(s=0;s<o.length;s++)c[o[s]]=n(o[s]);return c}function v(t,e,n){return n[e]!=null?n[e]:t.props[e]}function At(t,e){return ot(t.children,function(n){return l.cloneElement(n,{onExited:e.bind(null,n),in:!0,appear:v(n,"appear",t),enter:v(n,"enter",t),exit:v(n,"exit",t)})})}function _t(t,e,n){var i=ot(t.children),o=zt(e,i);return Object.keys(o).forEach(function(r){var s=o[r];if(l.isValidElement(s)){var c=r in e,u=r in i,f=e[r],h=l.isValidElement(f)&&!f.props.in;u&&(!c||h)?o[r]=l.cloneElement(s,{onExited:n.bind(null,s),in:!0,exit:v(s,"exit",t),enter:v(s,"enter",t)}):!u&&c&&!h?o[r]=l.cloneElement(s,{in:!1}):u&&c&&l.isValidElement(f)&&(o[r]=l.cloneElement(s,{onExited:n.bind(null,s),in:f.props.in,exit:v(s,"exit",t),enter:v(s,"enter",t)}))}}),o}var Yt=Object.values||function(t){return Object.keys(t).map(function(e){return t[e]})},Xt={component:"div",childFactory:function(e){return e}},rt=(function(t){$t(e,t);function e(i,o){var r;r=t.call(this,i,o)||this;var s=r.handleExited.bind(Ut(r));return r.state={contextValue:{isMounting:!0},handleExited:s,firstRender:!0},r}var n=e.prototype;return n.componentDidMount=function(){this.mounted=!0,this.setState({contextValue:{isMounting:!1}})},n.componentWillUnmount=function(){this.mounted=!1},e.getDerivedStateFromProps=function(o,r){var s=r.children,c=r.handleExited,u=r.firstRender;return{children:u?At(o,c):_t(o,s,c),firstRender:!1}},n.handleExited=function(o,r){var s=ot(this.props.children);o.key in s||(o.props.onExited&&o.props.onExited(r),this.mounted&&this.setState(function(c){var u=Dt({},c.children);return delete u[o.key],{children:u}}))},n.render=function(){var o=this.props,r=o.component,s=o.childFactory,c=Ft(o,["component","childFactory"]),u=this.state.contextValue,f=Yt(this.state.children).map(s);return delete c.appear,delete c.enter,delete c.exit,r===null?X.createElement(at.Provider,{value:u},f):X.createElement(at.Provider,{value:u},X.createElement(r,c,f))},e})(X.Component);rt.propTypes={};rt.defaultProps=Xt;const lt={};function ft(t,e){const n=l.useRef(lt);return n.current===lt&&(n.current=t(e)),n}const Kt=[];function Wt(t){l.useEffect(t,Kt)}class st{constructor(){Y(this,"currentId",null);Y(this,"clear",()=>{this.currentId!==null&&(clearTimeout(this.currentId),this.currentId=null)});Y(this,"disposeEffect",()=>this.clear)}static create(){return new st}start(e,n){this.clear(),this.currentId=setTimeout(()=>{this.currentId=null,n()},e)}}function Ht(){const t=ft(st.create).current;return Wt(t.disposeEffect),t}function ut(t){try{return t.matches(":focus-visible")}catch{}return!1}class q{constructor(){Y(this,"mountEffect",()=>{this.shouldMount&&!this.didMount&&this.ref.current!==null&&(this.didMount=!0,this.mounted.resolve())});this.ref={current:null},this.mounted=null,this.didMount=!1,this.shouldMount=!1,this.setShouldMount=null}static create(){return new q}static use(){const e=ft(q.create).current,[n,i]=l.useState(!1);return e.shouldMount=n,e.setShouldMount=i,l.useEffect(e.mountEffect,[n]),e}mount(){return this.mounted||(this.mounted=qt(),this.shouldMount=!0,this.setShouldMount(this.shouldMount)),this.mounted}start(...e){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.start(...e)})}stop(...e){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.stop(...e)})}pulsate(...e){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.pulsate(...e)})}}function Gt(){return q.use()}function qt(){let t,e;const n=new Promise((i,o)=>{t=i,e=o});return n.resolve=t,n.reject=e,n}function Zt(t){const{className:e,classes:n,pulsate:i=!1,rippleX:o,rippleY:r,rippleSize:s,in:c,onExited:u,timeout:f}=t,[h,d]=l.useState(!1),M=x(e,n.ripple,n.rippleVisible,i&&n.ripplePulsate),S={width:s,height:s,top:-(s/2)+r,left:-(s/2)+o},b=x(n.child,h&&n.childLeaving,i&&n.childPulsate);return!c&&!h&&d(!0),l.useEffect(()=>{if(!c&&u!=null){const B=setTimeout(u,f);return()=>{clearTimeout(B)}}},[u,c,f]),N.jsx("span",{className:M,style:S,children:N.jsx("span",{className:b})})}const g=pt("MuiTouchRipple",["root","ripple","rippleVisible","ripplePulsate","child","childLeaving","childPulsate"]),tt=550,Jt=80,Qt=et`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }

  100% {
    transform: scale(1);
    opacity: 0.3;
  }
`,te=et`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`,ee=et`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.92);
  }

  100% {
    transform: scale(1);
  }
`,ne=nt("span",{name:"MuiTouchRipple",slot:"Root"})({overflow:"hidden",pointerEvents:"none",position:"absolute",zIndex:0,top:0,right:0,bottom:0,left:0,borderRadius:"inherit"}),oe=nt(Zt,{name:"MuiTouchRipple",slot:"Ripple"})`
  opacity: 0;
  position: absolute;

  &.${g.rippleVisible} {
    opacity: 0.3;
    transform: scale(1);
    animation-name: ${Qt};
    animation-duration: ${tt}ms;
    animation-timing-function: ${({theme:t})=>t.transitions.easing.easeInOut};
  }

  &.${g.ripplePulsate} {
    animation-duration: ${({theme:t})=>t.transitions.duration.shorter}ms;
  }

  & .${g.child} {
    opacity: 1;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: currentColor;
  }

  & .${g.childLeaving} {
    opacity: 0;
    animation-name: ${te};
    animation-duration: ${tt}ms;
    animation-timing-function: ${({theme:t})=>t.transitions.easing.easeInOut};
  }

  & .${g.childPulsate} {
    position: absolute;
    /* @noflip */
    left: 0px;
    top: 0;
    animation-name: ${ee};
    animation-duration: 2500ms;
    animation-timing-function: ${({theme:t})=>t.transitions.easing.easeInOut};
    animation-iteration-count: infinite;
    animation-delay: 200ms;
  }
`,re=l.forwardRef(function(e,n){const i=ct({props:e,name:"MuiTouchRipple"}),{center:o=!1,classes:r={},className:s,...c}=i,[u,f]=l.useState([]),h=l.useRef(0),d=l.useRef(null);l.useEffect(()=>{d.current&&(d.current(),d.current=null)},[u]);const M=l.useRef(!1),S=Ht(),b=l.useRef(null),B=l.useRef(null),T=l.useCallback(p=>{const{pulsate:y,rippleX:R,rippleY:F,rippleSize:j,cb:U}=p;f(E=>[...E,N.jsx(oe,{classes:{ripple:x(r.ripple,g.ripple),rippleVisible:x(r.rippleVisible,g.rippleVisible),ripplePulsate:x(r.ripplePulsate,g.ripplePulsate),child:x(r.child,g.child),childLeaving:x(r.childLeaving,g.childLeaving),childPulsate:x(r.childPulsate,g.childPulsate)},timeout:tt,pulsate:y,rippleX:R,rippleY:F,rippleSize:j},h.current)]),h.current+=1,d.current=U},[r]),O=l.useCallback((p={},y={},R=()=>{})=>{const{pulsate:F=!1,center:j=o||y.pulsate,fakeElement:U=!1}=y;if((p==null?void 0:p.type)==="mousedown"&&M.current){M.current=!1;return}(p==null?void 0:p.type)==="touchstart"&&(M.current=!0);const E=U?null:B.current,w=E?E.getBoundingClientRect():{width:0,height:0,left:0,top:0};let V,C,I;if(j||p===void 0||p.clientX===0&&p.clientY===0||!p.clientX&&!p.touches)V=Math.round(w.width/2),C=Math.round(w.height/2);else{const{clientX:z,clientY:D}=p.touches&&p.touches.length>0?p.touches[0]:p;V=Math.round(z-w.left),C=Math.round(D-w.top)}if(j)I=Math.sqrt((2*w.width**2+w.height**2)/3),I%2===0&&(I+=1);else{const z=Math.max(Math.abs((E?E.clientWidth:0)-V),V)*2+2,D=Math.max(Math.abs((E?E.clientHeight:0)-C),C)*2+2;I=Math.sqrt(z**2+D**2)}p!=null&&p.touches?b.current===null&&(b.current=()=>{T({pulsate:F,rippleX:V,rippleY:C,rippleSize:I,cb:R})},S.start(Jt,()=>{b.current&&(b.current(),b.current=null)})):T({pulsate:F,rippleX:V,rippleY:C,rippleSize:I,cb:R})},[o,T,S]),K=l.useCallback(()=>{O({},{pulsate:!0})},[O]),k=l.useCallback((p,y)=>{if(S.clear(),(p==null?void 0:p.type)==="touchend"&&b.current){b.current(),b.current=null,S.start(0,()=>{k(p,y)});return}b.current=null,f(R=>R.length>0?R.slice(1):R),d.current=y},[S]);return l.useImperativeHandle(n,()=>({pulsate:K,start:O,stop:k}),[K,O,k]),N.jsx(ne,{className:x(g.root,r.root,s),ref:B,...c,children:N.jsx(rt,{component:null,exit:!0,children:u})})});function se(t){return Lt("MuiButtonBase",t)}const ie=pt("MuiButtonBase",["root","disabled","focusVisible"]),ae=t=>{const{disabled:e,focusVisible:n,focusVisibleClassName:i,classes:o}=t,s=vt({root:["root",e&&"disabled",n&&"focusVisible"]},se,o);return n&&i&&(s.root+=` ${i}`),s},le=nt("button",{name:"MuiButtonBase",slot:"Root"})({display:"inline-flex",alignItems:"center",justifyContent:"center",position:"relative",boxSizing:"border-box",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none",textDecoration:"none",color:"inherit","&::-moz-focus-inner":{borderStyle:"none"},[`&.${ie.disabled}`]:{pointerEvents:"none",cursor:"default"},"@media print":{colorAdjust:"exact"}}),fe=l.forwardRef(function(e,n){const i=ct({props:e,name:"MuiButtonBase"}),{action:o,centerRipple:r=!1,children:s,className:c,component:u="button",disabled:f=!1,disableRipple:h=!1,disableTouchRipple:d=!1,focusRipple:M=!1,focusVisibleClassName:S,LinkComponent:b="a",onBlur:B,onClick:T,onContextMenu:O,onDragLeave:K,onFocus:k,onFocusVisible:p,onKeyDown:y,onKeyUp:R,onMouseDown:F,onMouseLeave:j,onMouseUp:U,onTouchEnd:E,onTouchMove:w,onTouchStart:V,tabIndex:C=0,TouchRippleProps:I,touchRippleRef:z,type:D,...$}=i,A=l.useRef(null),m=Gt(),dt=J(m.ref,z),[L,W]=l.useState(!1);f&&L&&W(!1),l.useImperativeHandle(o,()=>({focusVisible:()=>{W(!0),A.current.focus()}}),[]);const ht=m.shouldMount&&!h&&!f;l.useEffect(()=>{L&&M&&!h&&m.pulsate()},[h,M,L,m]);const mt=P(m,"start",F,d),bt=P(m,"stop",O,d),gt=P(m,"stop",K,d),Mt=P(m,"stop",U,d),Rt=P(m,"stop",a=>{L&&a.preventDefault(),j&&j(a)},d),yt=P(m,"start",V,d),Et=P(m,"stop",E,d),xt=P(m,"stop",w,d),Tt=P(m,"stop",a=>{ut(a.target)||W(!1),B&&B(a)},!1),Ct=G(a=>{A.current||(A.current=a.currentTarget),ut(a.target)&&(W(!0),p&&p(a)),k&&k(a)}),Z=()=>{const a=A.current;return u&&u!=="button"&&!(a.tagName==="A"&&a.href)},Pt=G(a=>{M&&!a.repeat&&L&&a.key===" "&&m.stop(a,()=>{m.start(a)}),a.target===a.currentTarget&&Z()&&a.key===" "&&a.preventDefault(),y&&y(a),a.target===a.currentTarget&&Z()&&a.key==="Enter"&&!f&&(a.preventDefault(),T&&T(a))}),St=G(a=>{M&&a.key===" "&&L&&!a.defaultPrevented&&m.stop(a,()=>{m.pulsate(a)}),R&&R(a),T&&a.target===a.currentTarget&&Z()&&a.key===" "&&!a.defaultPrevented&&T(a)});let H=u;H==="button"&&($.href||$.to)&&(H=b);const _={};if(H==="button"){const a=!!$.formAction;_.type=D===void 0&&!a?"button":D,_.disabled=f}else!$.href&&!$.to&&(_.role="button"),f&&(_["aria-disabled"]=f);const wt=J(n,A),it={...i,centerRipple:r,component:u,disabled:f,disableRipple:h,disableTouchRipple:d,focusRipple:M,tabIndex:C,focusVisible:L},Vt=ae(it);return N.jsxs(le,{as:H,className:x(Vt.root,c),ownerState:it,onBlur:Tt,onClick:T,onContextMenu:bt,onFocus:Ct,onKeyDown:Pt,onKeyUp:St,onMouseDown:mt,onMouseLeave:Rt,onMouseUp:Mt,onDragLeave:gt,onTouchEnd:Et,onTouchMove:xt,onTouchStart:yt,ref:wt,tabIndex:f?-1:C,type:D,..._,...$,children:[s,ht?N.jsx(re,{ref:dt,center:r,...I}):null]})});function P(t,e,n,i=!1){return G(o=>(n&&n(o),i||t[e](o),!0))}function de(t){var d;const{elementType:e,externalSlotProps:n,ownerState:i,skipResolvingSlotProps:o=!1,...r}=t,s=o?{}:Nt(n,i),{props:c,internalRef:u}=Ot({...r,externalSlotProps:s}),f=J(u,s==null?void 0:s.ref,(d=t.additionalProps)==null?void 0:d.ref);return kt(e,{...c,ref:f},i)}export{fe as B,st as T,$t as _,G as a,de as b,Ft as c,at as d,ut as i,Ht as u};
