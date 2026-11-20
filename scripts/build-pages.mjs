/* Generate standalone pages with the homepage's shared header and footer. */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeupPage } from './makeup-page.mjs';
import { flowersPage } from './flowers-page.mjs';
import { aboutPage } from './about-page.mjs';
import { bagPage } from './bag-page.mjs';
import { checkoutPage } from './checkout-page.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const home=await readFile(resolve(root,'index.html'),'utf8');
const quickView=home.match(/<dialog\b[^>]*id="formula-quickview"[\s\S]*?<\/dialog>/)[0];
const breadcrumbs=label=>`<nav class="page-breadcrumb-bar" aria-label="Breadcrumb"><div class="atelier-wrap page-breadcrumb"><a href="index.html">Home</a><span class="page-breadcrumb-separator" aria-hidden="true">/</span><span aria-current="page">${label}</span></div></nav>`;
const skincareSteps=[['cleanse','Cleanse'],['step-2','Essence'],['step-3','Serum'],['step-4','Nourish'],['step-5','Moisturize'],['step-6','Eyes']];
const collection=`<section id="regimen" class="shop-collection catalogue-section skincare-catalogue" aria-labelledby="regimen-title"><div class="shop-collection-container"><div class="catalogue-heading"><div><p class="page-kicker">Choose your own ritual</p><h2 id="regimen-title">Nine formulas.<br><em>Endless little rituals.</em></h2></div><p>Six steps, in the order you use them.<br>Find the flowers that feel like you.</p></div><div class="shop-collection-toolbar"><div class="shop-collection-filters" role="group" aria-label="Filter skincare by step"><button type="button" data-bloom-filter="all" aria-pressed="true">All formulas</button>${skincareSteps.map(([filter,label])=>`<button type="button" data-bloom-filter="${filter}" aria-pressed="false">${label}</button>`).join('')}</div><span class="shop-collection-count" id="collection-count">9 formulas</span></div><div id="track" class="shop-product-grid"></div><p id="live" class="vh" aria-live="polite" aria-atomic="true"></p></div></section>`;

const ritualFormulas={
  'violet-tansy':{role:'Cleanse',name:'Violet Tansy',sku:'FIVTNPC'},
  'rose-calendula':{role:'Serum',name:'Rose Calendula',sku:'FIRCHS'},
  'superflower-juicy-dew':{role:'Moisturize',name:'Juicy Dew',sku:'FISJDHPM'},
  'periwinkle-butterfly':{role:'Essence',name:'Periwinkle Butterfly',sku:'FIPBHLE'},
  'cold-pressed-botanicals':{role:'Oil',name:'Cold Pressed Botanicals',sku:'FICPBMFN'},
  'triple-indigo':{role:'Night eye treatment',name:'Triple Indigo',sku:'FITIRPET'}
};
const ritualEdit=(id,title,line,copy,photos,filter)=>`<article class="skincare-edit skincare-edit--${filter}" id="${id}" aria-labelledby="${id}-title"><header class="skincare-edit-heading"><p class="skincare-edit-label">${filter==='ritual'?'Your everyday essentials':'The botanical edit'}</p><h3 id="${id}-title">${title}</h3><p class="skincare-edit-steps">${line}</p><p class="skincare-edit-description">${copy}</p></header><div class="skincare-edit-photos">${photos.map(([slug,alt])=>{const p=ritualFormulas[slug];return `<figure><button type="button" data-quick-view="${p.sku}" aria-label="View ${p.name} ${p.role}"><img src="img/${slug}.jpg" alt="${alt}" width="900" height="1125" loading="lazy"></button><figcaption><span>${p.role}</span>${p.name}</figcaption></figure>`;}).join('')}</div><div class="skincare-edit-footer"><span>${filter==='ritual'?'Start with the essentials.':'Explore a different trio.'}</span><button type="button" class="skincare-edit-action" data-bloom-filter="${filter}" data-scroll-to-formulas aria-pressed="false">Explore ${title.replace(/\.$/,'')}</button></div></article>`;

const pages={
  skincare:{
    label:'Skincare',description:'Explore the nine Flower Ink skincare formulas. Discover medicinal flowers, advanced actives and your everyday botanical ritual.',
    body:`${breadcrumbs('Skincare')}
      <section class="skincare-intro" aria-labelledby="page-title"><div class="atelier-wrap skincare-intro-layout"><div class="skincare-intro-copy"><p class="page-kicker">Flower Ink / The skincare collection</p><h1 id="page-title">A ritual,<br>rooted in<br> <em>flowers.</em></h1><p class="skincare-intro-description">Medicinal flowers. Clinical science.<br>Nine considered formulas, from your first cleanse to your last little moment of care.</p><a class="skincare-shop-link" href="#regimen">Shop the formulas</a><div class="skincare-intro-foot"><span class="flowericon" aria-hidden="true"></span><p>Better than clean.<br><span>Eleven years in the making.</span></p></div></div><div class="skincare-intro-visual"><figure class="skincare-intro-main"><img src="img/rose-calendula.jpg" alt="Flower Ink Rose Calendula serum surrounded by fresh pink blossoms and garden roses" width="900" height="900" fetchpriority="high"></figure></div></div></section>
      <section class="skincare-edits" id="rituals" aria-labelledby="skincare-edits-title"><div class="atelier-wrap"><div class="skincare-edits-heading"><div><p class="page-kicker">A beautiful place to begin</p><h2 id="skincare-edits-title">Your ritual. <em>Your way.</em></h2></div><p>Begin with a few thoughtful steps.<br> Make the rest your own.</p></div><div class="skincare-edits-grid">
      ${ritualEdit('the-ritual','The Ritual.','Cleanse / Serum / Moisturize','Your cleanser, Rose Calendula serum and Juicy Dew moisturizer. The three steps to begin with.',[['violet-tansy','Violet Tansy Nectar cleanser with a violet petal'],['rose-calendula','Rose Calendula serum with garden roses'],['superflower-juicy-dew','Juicy Dew moisturizer in pink peonies']],'ritual')}
      ${ritualEdit('botanical-icons','Botanical Icons.','Essence / Oil / Night eye treatment','Periwinkle Butterfly essence, Cold Pressed Botanicals oil and Triple Indigo eye treatment.',[['periwinkle-butterfly','Periwinkle Butterfly essence with blue-violet petals'],['cold-pressed-botanicals','Cold Pressed Botanicals oil with orange blossom'],['triple-indigo','Triple Indigo eye treatment with lilac flowers']],'icons')}
      </div></div></section>
      ${collection}
      <section class="skincare-botanical-note"><div class="atelier-wrap"><span class="flowericon" aria-hidden="true"></span><p>From the first petal<br>to the <em>final formula.</em></p><a class="page-text-link" href="the-flowers.html">Meet the flowers</a></div></section>
      <section class="skincare-color" id="makeup-preview" aria-labelledby="skincare-color-title"><div class="atelier-wrap skincare-color-layout"><figure><img src="img/lipstick-blush.png" alt="Flower Ink lipstick among soft pink peonies" width="1254" height="1254" loading="lazy"></figure><div><p class="page-kicker">After your skincare ritual</p><h2 id="skincare-color-title">A little care.<br><em>A little color.</em></h2><p>Flower-dyed makeup. Your finishing touch.</p><a class="skincare-shop-link" href="makeup.html">Explore makeup</a></div></div></section>`
  },
  makeup:{
    label:'Makeup',description:'Explore Flower Ink flower-dyed lipstick, Therapeutic Flowers Good For Skin Foundation and mattifying primer. A first look at makeup arriving after the skincare.',
    body:makeupPage(breadcrumbs('Makeup'))
  },
  'the-flowers':{
    label:'The Flowers',description:'Meet the medicinal flowers behind Flower Ink: violet, tansy, periwinkle, rose, calendula, jasmine, osmanthus, rosehip and indigo.',
    body:flowersPage(breadcrumbs('The Flowers'))
  },
  about:{
    label:'About',description:'The story behind Flower Ink. Eleven years of development, founder Susie Wang, and research, formulation and manufacturing under one roof in San Jose.',
    body:aboutPage(breadcrumbs('About'))
  }
};

pages.account={
  label:'Account',description:'Your Flower Ink space. Preview your profile, explore the collection and keep your botanical ritual close.',
  body:`${breadcrumbs('Account')}
    <section class="account-section" aria-labelledby="page-title"><div class="atelier-wrap account-layout"><div class="account-intro"><p class="page-kicker">Your Flower Ink account</p><h1 id="page-title">A little space<br><em>for you.</em></h1><p>Your formulas. Your next ritual. A place to come back to.</p><figure class="account-flower"><img src="img/ink-flower-plum.jpg" alt="An airy plum-colored botanical ink flower" width="900" height="900" loading="lazy"></figure></div>
    <div class="account-panel"><div id="account-entry"><div class="account-tabs" role="tablist" aria-label="Account access"><button type="button" role="tab" id="account-signin-tab" aria-selected="true" aria-controls="account-form-panel" data-account-mode="signin">Sign in</button><button type="button" role="tab" id="account-create-tab" aria-selected="false" aria-controls="account-form-panel" tabindex="-1" data-account-mode="create">Create account</button></div><div id="account-form-panel" role="tabpanel" aria-labelledby="account-signin-tab"><h2 id="account-form-title">Welcome back.</h2><p id="account-form-copy">Start with your email and explore your Flower Ink space.</p><form id="account-form" novalidate><div class="commerce-field" id="account-name-field" hidden><label for="account-name">Your name</label><input id="account-name" name="name" type="text" autocomplete="name" maxlength="80" disabled></div><div class="commerce-field"><label for="account-email">Email address</label><input id="account-email" name="email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com"></div><button type="submit" class="commerce-button">Continue in preview <span aria-hidden="true">&rarr;</span></button><p class="commerce-message" id="account-message" role="status" aria-live="polite"></p></form><p class="commerce-preview-note">Account preview. Your details stay on this device; no sign-in email is sent.</p></div></div>
    <div id="account-dashboard" hidden><div class="account-welcome"><span class="page-kicker">Your preview profile</span><button type="button" class="commerce-text-button" data-account-leave>Leave preview</button></div><h2 id="account-greeting">Welcome back.</h2><p class="account-device-note">Saved on this device.</p><form id="profile-form" novalidate><div class="commerce-field"><label for="profile-name">Your name</label><input id="profile-name" name="name" type="text" autocomplete="name" maxlength="80"></div><div class="commerce-field"><label for="profile-email">Email address</label><input id="profile-email" name="email" type="email" autocomplete="email" maxlength="254" required></div><button class="commerce-button" type="submit">Save profile <span aria-hidden="true">&rarr;</span></button><p class="commerce-message" id="profile-message" role="status" aria-live="polite"></p></form><a href="bag.html" class="account-bag-shortcut">Your bag <span data-account-bag-count>0 items</span><span aria-hidden="true">&nearr;</span></a><div class="account-orders"><span class="flowericon" aria-hidden="true"></span><div><h3>The beginning of your ritual.</h3><p>No orders yet. Explore the formulas and find your daily dose of bloom.</p><a href="skincare.html" class="page-text-link">Explore skincare <span aria-hidden="true">&nearr;</span></a></div></div></div></div>
    </div></section>`
};
pages.bag={
  label:'Your Bag',description:'Your Flower Ink bag. Review your formulas, update quantities and explore your next botanical ritual.',
  body:bagPage(breadcrumbs('Your Bag'))
};
pages.checkout={label:'Checkout',description:'Preview your Flower Ink checkout. Review your formulas, contact details, delivery address and order summary.',body:checkoutPage(breadcrumbs('Checkout'))};

const pageStyles={skincare:'skincare.css',makeup:'makeup-page.css','the-flowers':'flowers-page.css?v=strip-cream-6',about:'about-page.css',bag:'bag-page.css',checkout:'checkout-page.css'};
const pageScripts={makeup:'makeup-page.js','the-flowers':'flowers-page.js',bag:'bag-page.js',checkout:'checkout-page.js'};
for(const [slug,page] of Object.entries(pages)){
  let prefix=home.slice(0,home.indexOf('<main'))
    .replace(/<title>.*?<\/title>/,`<title>${page.label} — Flower Ink</title>`)
    .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${page.description}">`)
    .replace('data-route="home"',`data-route="${slug}"`)
    .replace('</head>',`${pageStyles[slug]?`<link rel="stylesheet" href="${pageStyles[slug]}">\n`:''}</head>`);
  let suffix=home.slice(home.indexOf('<footer'));
  if(pageScripts[slug])suffix=suffix.replace('</body>',`<script src="${pageScripts[slug]}"></script>\n</body>`);
  const active=new RegExp(`<a href="${slug}\\.html"([^>]*)>`,'g');
  prefix=prefix.replace(active,`<a href="${slug}.html"$1 aria-current="page">`);
  suffix=suffix.replace(active,`<a href="${slug}.html"$1 aria-current="page">`);
  const content=`${prefix}<main id="main" tabindex="-1"><div class="view atelier-page subpage page-${slug}">${page.body}</div>${quickView}</main>\n${suffix}`;
  await writeFile(resolve(root,`${slug}.html`),content,'utf8');
  console.log(`Built ${slug}.html`);
}
