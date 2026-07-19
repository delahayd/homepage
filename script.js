const publications = [
  {year:2022,type:'conference',title:'Goéland: A Concurrent Tableau-Based Theorem Prover (System Description)',authors:'J. Cailler, J. Rosain, D. Delahaye, S. Robillard, H.-L. Bouziane',venue:'IJCAR · LNCS 13385 · 359–368 · Springer'},
  {year:2020,type:'journal',title:'First-Order Automated Reasoning with Theories: When Deduction Modulo Theory Meets Practice',authors:'G. Burel, G. Bury, R. Cauderlier, D. Delahaye, P. Halmagrand, O. Hermant',venue:'Journal of Automated Reasoning 64(6) · 1001–1050'},
  {year:2020,type:'workshop',title:'Toward the Formal Verification of HILECOP: Formalization and Implementation of Synchronously Executed Petri Nets',authors:'V. Iampietro, D. Andreu, D. Delahaye',venue:'PNSE · CEUR Workshop Proceedings 2651 · 214–215'},
  {year:2019,type:'conference',title:'Graph-Based Variability Modelling: Towards a Classification of Existing Formalisms',authors:'J. Carbonnel, D. Delahaye, M. Huchard, C. Nebut',venue:'ICCS · LNCS 11530 · 27–41 · Springer'},
  {year:2018,type:'conference',title:'An Automation-Friendly Set Theory for the B Method',authors:'G. Bury, S. Cruanes, D. Delahaye, P.-L. Euvrard',venue:'ABZ · LNCS 10817 · 409–414 · Springer'},
  {year:2018,type:'workshop',title:'SMT Solving Modulo Tableau and Rewriting Theories',authors:'G. Bury, S. Cruanes, D. Delahaye',venue:'SMT Workshop · Oxford'},
  {year:2018,type:'conference',title:'Recovering Three-Level Architectures from the Code of Open-Source Java Spring Projects',authors:'A. Le Borgne, D. Delahaye, M. Huchard, C. Urtado, S. Vauttier',venue:'SEKE · 199–198'},
  {year:2017,type:'conference',title:'Substitutability-Based Version Propagation to Manage the Evolution of Three-Level Component-Based Architectures',authors:'A. Le Borgne, D. Delahaye, M. Huchard, C. Urtado, S. Vauttier',venue:'SEKE · 18–23'},
  {year:2015,type:'conference',title:'Automated Deduction in the B Set Theory using Typed Proof Search and Deduction Modulo',authors:'G. Bury, D. Delahaye, D. Doligez, P. Halmagrand, O. Hermant',venue:'LPAR · EPiC Series in Computing 35 · 42–58'},
  {year:2015,type:'conference',title:'Integrating Simplex with Tableaux',authors:'G. Bury, D. Delahaye',venue:'TABLEAUX · LNCS 9323 · 86–101 · Springer'},
  {year:2015,type:'journal',title:'Verifying B Proof Rules using Deep Embedding and Automated Theorem Proving',authors:'M. Jacquel, K. Berkani, D. Delahaye, C. Dubois',venue:'Software and Systems Modeling 14(1) · 101–119'},
  {year:2014,type:'conference',title:'The BWare Project: Building a Proof Platform for the Automated Verification of B Proof Obligations',authors:'D. Delahaye, C. Dubois, C. Marché, D. Mentré',venue:'ABZ · LNCS 8477 · 290–293 · Springer'},
  {year:2013,type:'conference',title:'Zenon Modulo: When Achilles Outruns the Tortoise using Deduction Modulo',authors:'D. Delahaye, D. Doligez, F. Gilbert, P. Halmagrand, O. Hermant',venue:'LPAR · LNCS 8312 · 274–290 · Springer'},
  {year:2013,type:'journal',title:'Recovering Intuition from Automated Formal Proofs using Tableaux with Superdeduction',authors:'D. Delahaye, M. Jacquel',venue:'Electronic Journal of Mathematics and Technology 7(2)'},
  {year:2012,type:'conference',title:'Producing Certified Functional Code from Inductive Specifications',authors:'P.-N. Tollitte, D. Delahaye, C. Dubois',venue:'CPP · LNCS 7679 · 76–91 · Springer'},
  {year:2012,type:'conference',title:'Tableaux Modulo Theories using Superdeduction',authors:'M. Jacquel, K. Berkani, D. Delahaye, C. Dubois',venue:'IJCAR · LNCS 7364 · 332–338 · Springer'},
  {year:2008,type:'journal',title:'A Formal and Sound Transformation from Focal to UML',authors:'D. Delahaye, J.-F. Étienne, V. Viguié Donzeau-Gouge',venue:'Innovations in Systems and Software Engineering 4(3) · 267–274'},
  {year:2007,type:'conference',title:'Zenon: An Extensible Automated Theorem Prover Producing Checkable Proofs',authors:'R. Bonichon, D. Delahaye, D. Doligez',venue:'LPAR · LNCS 4790 · 151–165 · Springer'},
  {year:2005,type:'journal',title:'Dealing with Algebraic Expressions over a Field in Coq using Maple',authors:'D. Delahaye, M. Mayero',venue:'Journal of Symbolic Computation 39(5) · 569–592'},
  {year:2002,type:'conference',title:'Free-Style Theorem Proving',authors:'D. Delahaye',venue:'TPHOLs · LNCS 2410 · 164–181 · Springer'},
  {year:2000,type:'conference',title:'A Tactic Language for the System Coq',authors:'D. Delahaye',venue:'LPAR · LNCS 1955 · 85–95 · Springer'},
  {year:1999,type:'conference',title:'Information Retrieval in a Coq Proof Library using Type Isomorphisms',authors:'D. Delahaye',venue:'TYPES · LNCS 1956 · 131–147 · Springer'}
];
const labels={journal:'Revue',conference:'Conférence',workshop:'Atelier'};
const list=document.querySelector('#pub-list'), search=document.querySelector('#pub-search'), empty=document.querySelector('#pub-empty');let filter='all';
function render(){const q=search.value.toLocaleLowerCase('fr');const shown=publications.filter(p=>(filter==='all'||p.type===filter)&&`${p.title} ${p.authors} ${p.venue} ${p.year}`.toLocaleLowerCase('fr').includes(q));list.innerHTML=shown.map(p=>`<article class="pub-item"><span class="year">${p.year}</span><div><h3>${p.title}</h3><p>${p.authors}</p><p>${p.venue}</p></div><span class="pub-type">${labels[p.type]}</span></article>`).join('');empty.hidden=shown.length>0}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('[data-filter].active').classList.remove('active');b.classList.add('active');filter=b.dataset.filter;render()}));search.addEventListener('input',render);render();
const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#nav');toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});nav.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')});document.querySelector('#year').textContent=new Date().getFullYear();

// Small, dependency-free propositional prover. It parses the usual operators,
// explores every semantic branch, and exposes countermodels when a branch stays open.
const formulaInput=document.querySelector('#formula');
const proverButton=document.querySelector('#run-prover');
const proverOutput=document.querySelector('#proof-output');
function tokenize(source){
  const tokens=source.match(/->|[A-Za-z][A-Za-z0-9_]*|[()!&|]/g)||[];
  if(tokens.join('').length!==source.replace(/\s/g,'').length)throw new Error('Caractère non reconnu.');
  return tokens;
}
function parseFormula(source){
  const t=tokenize(source);let i=0;
  const peek=()=>t[i], take=x=>peek()===x?(i++,true):false;
  function atom(){if(take('(')){const n=imp();if(!take(')'))throw new Error('Parenthèse fermante attendue.');return n}const name=peek();if(!name||!/^[A-Za-z]/.test(name))throw new Error('Proposition attendue.');i++;return{op:'var',name}}
  function neg(){return take('!')?{op:'not',a:neg()}:atom()}
  function and(){let n=neg();while(take('&'))n={op:'and',a:n,b:neg()};return n}
  function or(){let n=and();while(take('|'))n={op:'or',a:n,b:and()};return n}
  function imp(){const n=or();return take('->')?{op:'imp',a:n,b:imp()}:n}
  const tree=imp();if(i<t.length)throw new Error(`Jeton inattendu : ${t[i]}`);return tree;
}
function evaluate(n,v){if(n.op==='var')return v[n.name];if(n.op==='not')return !evaluate(n.a,v);if(n.op==='and')return evaluate(n.a,v)&&evaluate(n.b,v);if(n.op==='or')return evaluate(n.a,v)||evaluate(n.b,v);return !evaluate(n.a,v)||evaluate(n.b,v)}
function variables(n,set=new Set()){if(n.op==='var')set.add(n.name);else{variables(n.a,set);if(n.b)variables(n.b,set)}return[...set]}
function prove(){
  try{
    const tree=parseFormula(formulaInput.value),vars=variables(tree);
    if(vars.length>6)throw new Error('Le démonstrateur est limité à 6 propositions.');
    const branches=[];let countermodel=null;
    for(let mask=0;mask<2**vars.length;mask++){
      const valuation=Object.fromEntries(vars.map((name,j)=>[name,Boolean(mask&(1<<j))]));
      const closes=evaluate(tree,valuation);if(!closes&&!countermodel)countermodel=valuation;
      branches.push({valuation,closes});
    }
    const valid=!countermodel;
    const branchHtml=branches.map((b,index)=>`<div class="proof-step ${b.closes?'closed':'open'}"><span>branch ${String(index+1).padStart(2,'0')}</span> · ${Object.entries(b.valuation).map(([k,v])=>`${k}=${v?'⊤':'⊥'}`).join(', ')} · ${b.closes?'× closed':'○ open'}</div>`).join('');
    proverOutput.innerHTML=`<div class="proof-result ${valid?'valid':'invalid'}">${valid?'✓ VALID — toutes les branches sont fermées':'○ NOT VALID — contre-modèle trouvé'}</div>${branchHtml}${countermodel?`<div class="proof-result invalid">countermodel = { ${Object.entries(countermodel).map(([k,v])=>`${k}: ${v}`).join(', ')} }</div>`:''}`;
  }catch(error){proverOutput.innerHTML=`<div class="proof-result invalid">Syntax error: ${error.message}</div>`}
}
proverButton?.addEventListener('click',prove);
formulaInput?.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key==='Enter')prove()});
