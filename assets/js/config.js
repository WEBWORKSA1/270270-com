/* 270270 Number Lab: site configuration.
   Edit this file to switch on AdSense, payment links, your YouTube channel, etc.
   PRIVACY: the site inbox is never written in plain text anywhere. It is stored
   below as shifted, reversed char codes and decoded only at submit/click time.
   After activating FormSubmit (first submission sends a confirmation email),
   paste the random alias FormSubmit gives you into FORM_ALIAS. The obfuscated
   inbox is then no longer used for forms at all. */
window.NL_CONFIG = {
  SITE_NAME: '270270 · Number Lab',
  SITE_URL: 'https://270270.com',
  CONTACT_URL: 'https://web.works/contact',

  // Forms: FormSubmit.co (free, no backend)
  _k: [116, 118, 106, 53, 115, 112, 104, 116, 110, 71, 56, 104, 122, 114, 121, 118, 126, 105, 108, 126],
  FORM_ALIAS: '', // e.g. 'a1b2c3d4e5f6...' from FormSubmit after activation

  // Google AdSense: set your publisher ID (also set ADSENSE_CLIENT in tools/build.py)
  ADSENSE_CLIENT: '', // e.g. 'ca-pub-1234567890123456'
  ADSENSE_SLOTS: { top: '', inArticle: '', sidebar: '', footer: '' },

  // Donations: PayPal Donate works out of the box (the inbox is decoded at click time).
  // Optional extra payment links (leave '' to hide):
  PAYPAL_DONATE: true,
  KOFI_URL: '',
  BUYMEACOFFEE_URL: '',
  STRIPE_LINK: '',
  GITHUB_SPONSORS_URL: '',

  // YouTube channel (for Subscribe buttons). Leave '' to hide.
  YOUTUBE_CHANNEL: '',

  // Fundraising goal shown on Support page (update monthly)
  GOAL: { label: 'Monthly operations goal', target: 888, raised: 0, currency: 'USD' },

  // Current contest end date (ISO). Rolls to the end of the current month if past.
  CONTEST_END: ''
};
