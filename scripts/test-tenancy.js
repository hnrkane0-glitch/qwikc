
const vm=require('vm'),fs=require('fs'),assert=require('assert');
const data={qc_logged_user:'merchant-a',qc_session:JSON.stringify({username:'merchant-a',dbUrl:''})};
const localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>data[k]=v,removeItem:k=>delete data[k]};
const ctx={window:{},localStorage,fetch:async()=>({ok:true,json:async()=>({})}),btoa:s=>Buffer.from(s).toString('base64'),encodeURIComponent};
vm.runInNewContext(fs.readFileSync('qc-db.js','utf8'),ctx);
assert.equal(ctx.window.QCDB.base(),'https://sneakerai-c96f0-default-rtdb.firebaseio.com/users/merchant-a');
assert.equal(ctx.window.QCDB.baseFor('merchant-b'),'https://sneakerai-c96f0-default-rtdb.firebaseio.com/users/merchant-b');
data.qc_logged_user='admin';data.qc_session=JSON.stringify({username:'admin'});
assert.equal(ctx.window.QCDB.base(),'https://sneakerai-c96f0-default-rtdb.firebaseio.com');
data.qc_is_staff='1';data.qc_session=JSON.stringify({username:'merchant-a',ownerUsername:'merchant-a',modules:['POS']});
assert.equal(ctx.window.QCDB.base(),'https://sneakerai-c96f0-default-rtdb.firebaseio.com/users/merchant-a');
assert.equal(ctx.window.QCDB.can('POS'),true);assert.equal(ctx.window.QCDB.can('Settings'),false);
console.log('PASS tenant namespace and staff permission smoke tests');
