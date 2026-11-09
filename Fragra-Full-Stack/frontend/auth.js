'use strict';
const form = document.getElementById('authForm');
const nameField = document.getElementById('nameField');
const toggleAuth = document.getElementById('toggleAuth');
const message = document.getElementById('message');
const urlParams = new URLSearchParams(location.search);
const next = urlParams.get('next');
let isSignup = urlParams.get('signup') === '1';
function setMode(signup) {
    isSignup = signup;
    nameField.hidden = !isSignup;
    document.getElementById('name').required = isSignup;
    document.getElementById('formTitle').textContent = isSignup ? 'Create Account' : 'Welcome Back';
    document.getElementById('formSubtitle').textContent = isSignup ? 'Join Fragra to order your decants' : 'Sign in to continue';
    document.getElementById('submitBtn').textContent = isSignup ? 'CREATE ACCOUNT' : 'SIGN IN';
    document.getElementById('switchPrompt').textContent = isSignup ? 'Already have an account?' : 'New to Fragra?';
    toggleAuth.textContent = isSignup ? 'Sign in' : 'Create an account';
    message.textContent = '';
}
setMode(isSignup);
toggleAuth.addEventListener('click',event=>{event.preventDefault();setMode(!isSignup);});
form.addEventListener('submit', async event=>{
    event.preventDefault();
    const btn=document.getElementById('submitBtn');btn.disabled=true;
    const data={email:document.getElementById('email').value.trim(),password:document.getElementById('password').value};
    if(isSignup)data.name=document.getElementById('name').value.trim();
    try {
        const result=await fragraRequest('/auth/'+(isSignup?'signup':'login'),{method:'POST',body:JSON.stringify(data)});
        localStorage.setItem('fragraToken',result.token);
        localStorage.setItem('fragraName',result.name);
        sessionStorage.removeItem('fragraToken');
        sessionStorage.removeItem('fragraName');
        // Only allow navigation to known local pages; never redirect to arbitrary URLs.
        const permitted=['checkout.html','orders.html','account.html','cart.html'];
        location.href=permitted.includes(next)?next:'Fragra.html';
    } catch(err) {fragraSetStatus(message,err.message,true);btn.disabled=false;}
});
