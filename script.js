// Helper: sanitize hex
const toHex = (v, fallback) => {
  if (!v) return fallback;
  v = v.trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(v)) return v.startsWith('#') ? v : `#${v}`;
  return fallback;
};

const els = {
  baseUrl: document.getElementById('baseUrl'),
  utm_source: document.getElementById('utm_source'),
  utm_medium: document.getElementById('utm_medium'),
  utm_campaign: document.getElementById('utm_campaign'),
  utm_term: document.getElementById('utm_term'),
  utm_content: document.getElementById('utm_content'),
  buildUtm: document.getElementById('buildUtm'),
  copyUtm: document.getElementById('copyUtm'),

  data: document.getElementById('data'),
  fgText: document.getElementById('fgColor'),
  fgPick: document.getElementById('fgPicker'),
  bgText: document.getElementById('bgColor'),
  bgPick: document.getElementById('bgPicker'),
  dotsType: document.getElementById('dotsType'),
  cornerSqType: document.getElementById('cornerSqType'),
  cornerDotType: document.getElementById('cornerDotType'),
  size: document.getElementById('size'),
  margin: document.getElementById('margin'),
  ecLevel: document.getElementById('ecLevel'),
  logo: document.getElementById('logo'),
  logoSize: document.getElementById('logoSize'),
  logoMargin: document.getElementById('logoMargin'),
  hideBgDots: document.getElementById('hideBgDots'),
  filetype: document.getElementById('filetype'),
  generate: document.getElementById('generate'),
  download: document.getElementById('download'),
  preview: document.getElementById('preview'),
  finalUrl: document.getElementById('finalUrl')
};

// sync color fields
const sync = (a, b) => {
  a.addEventListener('input', () => b.value = toHex(a.value, b.value));
  b.addEventListener('input', () => a.value = b.value);
};
sync(els.fgText, els.fgPick);
sync(els.bgText, els.bgPick);

// Build UTM URL
function buildUTMUrl() {
  const base = (els.baseUrl.value || '').trim();
  if (!base) {
    alert('Please enter a base URL');
    return '';
  }
  const params = [];
  const add = (k, v) => {
    if (v && v.trim()) params.push(`${encodeURIComponent(k)}=${encodeURIComponent(v.trim())}`);
  };
  add('utm_source', els.utm_source.value);
  add('utm_medium', els.utm_medium.value);
  add('utm_campaign', els.utm_campaign.value);
  add('utm_term', els.utm_term.value);
  add('utm_content', els.utm_content.value);
  if (params.length === 0) {
    alert('Please enter at least one UTM parameter (source/medium/campaign)');
    return '';
  }
  const sep = base.includes('?') ? '&' : '?';
  const final = base + sep + params.join('&');
  els.data.value = final;
  els.finalUrl.textContent = final;
  updateQR();
  return final;
}

els.buildUtm.addEventListener('click', () => {
  const u = buildUTMUrl();
  if (u) navigator.clipboard?.writeText(u).catch(() => {});
});

els.copyUtm.addEventListener('click', () => {
  const v = els.data.value.trim();
  if (!v) {
    alert('No URL to copy');
    return;
  }
  navigator.clipboard.writeText(v)
    .then(() => alert('Copied URL to clipboard'))
    .catch(() => alert('Could not copy'));
});

// Base QR instance
const qr = new QRCodeStyling({
  width: parseInt(els.size.value, 10),
  height: parseInt(els.size.value, 10),
  type: 'svg',
  data: '',
  qrOptions: { errorCorrectionLevel: els.ecLevel.value, margin: parseInt(els.margin.value, 10) },
  backgroundOptions: { color: els.bgText.value },
  dotsOptions: { color: els.fgText.value, type: els.dotsType.value },
  cornersSquareOptions: { color: els.fgText.value, type: els.cornerSqType.value },
  cornersDotOptions: { color: els.fgText.value, type: els.cornerDotType.value },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: parseInt(els.logoMargin.value, 10),
    imageSize: parseInt(els.logoSize.value, 10) / 100,
    hideBackgroundDots: els.hideBgDots.checked
  }
});
qr.append(els.preview);

let currentLogoDataUrl = null;
els.logo.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) {
    currentLogoDataUrl = null;
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    currentLogoDataUrl = reader.result;
    updateQR();
  };
  reader.readAsDataURL(file);
});

function updateQR() {
  const data = els.data.value.trim();
  els.finalUrl.textContent = data || '(no url yet)';
  const fg = toHex(els.fgText.value, '#111111');
  const bg = toHex(els.bgText.value, '#ffffff');
  const size = Math.max(200, Math.min(1200, parseInt(els.size.value, 10) || 420));
  const margin = Math.max(0, Math.min(50, parseInt(els.margin.value, 10) || 4));
  const imageSize = Math.max(0.05, Math.min(0.45, (parseInt(els.logoSize.value, 10) || 22) / 100));
  const logoMargin = Math.max(0, Math.min(40, parseInt(els.logoMargin.value, 10) || 6));

  qr.update({
    width: size,
    height: size,
    data: data || ' ',
    qrOptions: { errorCorrectionLevel: els.ecLevel.value, margin },
    backgroundOptions: { color: bg },
    dotsOptions: { color: fg, type: els.dotsType.value },
    cornersSquareOptions: { color: fg, type: els.cornerSqType.value },
    cornersDotOptions: { color: fg, type: els.cornerDotType.value },
    image: currentLogoDataUrl || undefined,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: logoMargin,
      imageSize,
      hideBackgroundDots: els.hideBgDots.checked
    }
  });
}

els.generate.addEventListener('click', updateQR);
els.download.addEventListener('click', () => {
  const ext = els.filetype.value;
  qr.download({ name: 'qr', extension: ext });
});

// Initialize
els.data.value = '';
els.baseUrl.value = '';
updateQR();


