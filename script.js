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
  {year:2014,type:'conference',title:'The BWare Project: Building a Proof Platform for the Automated Verification of B Proof Obligations',authors:'D. Delahaye, C. Dubois, C. Marché, D. Mentré',venue:'ABZ · LNCS 8477 · 290–293 · Springer',pdf:"bware (ABZ'14).pdf"},
  {year:2013,type:'conference',title:'Zenon Modulo: When Achilles Outruns the Tortoise using Deduction Modulo',authors:'D. Delahaye, D. Doligez, F. Gilbert, P. Halmagrand, O. Hermant',venue:'LPAR · LNCS 8312 · 274–290 · Springer',pdf:"zen-mod (LPAR'13).pdf"},
  {year:2013,type:'journal',title:'Recovering Intuition from Automated Formal Proofs using Tableaux with Superdeduction',authors:'D. Delahaye, M. Jacquel',venue:'Electronic Journal of Mathematics and Technology 7(2)',pdf:"sded-proofs (eJMT'13).pdf"},
  {year:2012,type:'conference',title:'Producing Certified Functional Code from Inductive Specifications',authors:'P.-N. Tollitte, D. Delahaye, C. Dubois',venue:'CPP · LNCS 7679 · 76–91 · Springer',pdf:"relext-coq (CPP'12).pdf"},
  {year:2012,type:'conference',title:'Tableaux Modulo Theories using Superdeduction',authors:'M. Jacquel, K. Berkani, D. Delahaye, C. Dubois',venue:'IJCAR · LNCS 7364 · 332–338 · Springer',pdf:"tab-sded (IJCAR'12).pdf"},
  {year:2008,type:'journal',title:'A Formal and Sound Transformation from Focal to UML',authors:'D. Delahaye, J.-F. Étienne, V. Viguié Donzeau-Gouge',venue:'Innovations in Systems and Software Engineering 4(3) · 267–274',pdf:'focal-uml (UML&FM\'08).pdf'},
  {year:2007,type:'conference',title:'Zenon: An Extensible Automated Theorem Prover Producing Checkable Proofs',authors:'R. Bonichon, D. Delahaye, D. Doligez',venue:'LPAR · LNCS 4790 · 151–165 · Springer',pdf:"zenon (LPAR'07).pdf"},
  {year:2005,type:'journal',title:'Dealing with Algebraic Expressions over a Field in Coq using Maple',authors:'D. Delahaye, M. Mayero',venue:'Journal of Symbolic Computation 39(5) · 569–592',pdf:"coq-maple (JSC'05).pdf"},
  {year:2002,type:'conference',title:'Free-Style Theorem Proving',authors:'D. Delahaye',venue:'TPHOLs · LNCS 2410 · 164–181 · Springer',pdf:"lpdt (TPHOLs'02).pdf"},
  {year:2000,type:'conference',title:'A Tactic Language for the System Coq',authors:'D. Delahaye',venue:'LPAR · LNCS 1955 · 85–95 · Springer',pdf:"ltac (LPAR'00).pdf"},
  {year:1999,type:'conference',title:'Information Retrieval in a Coq Proof Library using Type Isomorphisms',authors:'D. Delahaye',venue:'TYPES · LNCS 1956 · 131–147 · Springer',pdf:"type-isos (TYPES'99).pdf"}
];
const labels={journal:'Journal',conference:'Conference',workshop:'Workshop'};
const list=document.querySelector('#pub-list'), search=document.querySelector('#pub-search'), empty=document.querySelector('#pub-empty');let filter='all';
function render(){const q=search.value.toLocaleLowerCase('en');const shown=publications.filter(p=>(filter==='all'||p.type===filter)&&`${p.title} ${p.authors} ${p.venue} ${p.year}`.toLocaleLowerCase('en').includes(q));list.innerHTML=shown.map(p=>`<article class="pub-item"><span class="year">${p.year}</span><div><h3>${p.title}</h3><p>${p.authors}</p><p>${p.venue}</p>${p.pdf?`<a class="pdf-link" href="papers/${encodeURIComponent(p.pdf)}" target="_blank">PDF ↓</a>`:''}</div><span class="pub-type">${labels[p.type]}</span></article>`).join('');empty.hidden=shown.length>0}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('[data-filter].active').classList.remove('active');b.classList.add('active');filter=b.dataset.filter;render()}));search.addEventListener('input',render);render();
const paperArchive=[
  [2014,'Tableaux Modulo Theories using Superdeduction',"tab-sded (GJASE'14).pdf"],
  [2014,'The BWare Project',"bware (ABZ'14).pdf"],
  [2014,'The BWare Project — AFADL',"bware (AFADL'14).pdf"],
  [2013,'Zenon Modulo',"zen-mod (LPAR'13).pdf"],
  [2013,'Proof Certification in Zenon Modulo',"zen-mod (IWIL'13).pdf"],
  [2013,'Recovering Intuition from Automated Formal Proofs',"sded-proofs (eJMT'13).pdf"],
  [2012,'Producing Certified Functional Code from Inductive Specifications',"relext-coq (CPP'12).pdf"],
  [2012,'Tableaux Modulo Theories using Superdeduction',"tab-sded (IJCAR'12).pdf"],
  [2011,'Verifying B Proof Rules',"b2zenon (SEFM'11).pdf"],
  [2010,'Assisting Users of Proof Assistants — Habilitation Thesis','Delahaye (HDR Thesis).pdf'],
  [2010,'Certified Functional Code Generation',"rel-exec (JFLA'10).pdf"],
  [2009,'Developing Structured Libraries using Focal',"focal-mod (MLPA'09).pdf"],
  [2008,'A Formal and Sound Transformation from Focal to UML','focal-uml (UML&FM\'08).pdf'],
  [2008,'Producing UML Models from Focal Specifications',"focal-uml (TASE'08).pdf"],
  [2008,'Formal Modeling of Airport Security Regulations',"edemoi (RELAW'08).pdf"],
  [2007,'Extracting Purely Functional Contents from Logical Inductive Types',"pred-exec (TPHOLs'07).pdf"],
  [2007,'Zenon: An Extensible Automated Theorem Prover',"zenon (LPAR'07).pdf"],
  [2006,'Certifying Airport Security Regulations',"edemoi (FM'06).pdf"],
  [2006,'Reasoning about Airport Security Regulations',"edemoi (ISoLA'06).pdf"],
  [2006,'Modeling Airport Security Regulations in Focal',"edemoi (REMO2V'06).pdf"],
  [2005,'Dealing with Algebraic Expressions over a Field in Coq using Maple',"coq-maple (JSC'05).pdf"],
  [2005,'Quantifier Elimination over Algebraically Closed Fields',"qelim (Calculemus'05).pdf"],
  [2005,"Diophantus’ 20th Problem and Fermat’s Last Theorem",'Fermat4 (draft).pdf'],
  [2004,'Coq as a Teaching Tool',"coq-edu (TSI'04).pdf"],
  [2002,'Free-Style Theorem Proving',"lpdt (TPHOLs'02).pdf"],
  [2002,'A Proof-Dedicated Meta-Language',"ltac (LFM'02).pdf"],
  [2001,'Designing Languages for Proofs and Automation — PhD Thesis','Delahaye (PhD Thesis).pdf'],
  [2001,'Field: A Decision Procedure for Real Numbers in Coq',"field (JFLA'01).pdf"],
  [2000,'A Tactic Language for the System Coq',"ltac (LPAR'00).pdf"],
  [1999,'Information Retrieval in a Coq Proof Library using Type Isomorphisms',"type-isos (TYPES'99).pdf"]
];
const archive=document.querySelector('#paper-archive');
if(archive)archive.innerHTML=paperArchive.map(([year,title,file])=>`<a href="papers/${encodeURIComponent(file)}" target="_blank"><span>${year}</span><strong>${title}</strong><b>PDF ↓</b></a>`).join('');
const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#nav');toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});nav.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')});document.querySelector('#year').textContent=new Date().getFullYear();
