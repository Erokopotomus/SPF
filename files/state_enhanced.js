// SYP Analytics - State & Constants (Enhanced for SPF/Spruce Trading)

// ==================== TRADING MODE ====================
const TRADING_MODES = ['syp', 'spf']; // SYP = Southern Yellow Pine, SPF = Spruce-Pine-Fir

// ==================== PRODUCTS ====================
// SYP Products (existing)
const SYP_PRODUCTS=['2x4#2','2x6#2','2x8#2','2x10#2','2x12#2','2x4#3','2x6#3','2x8#3'];

// SPF Products (new) - with dimensions, lengths, grades
const SPF_PRODUCTS = [
  // 2x4
  '2x4 #2', '2x4 #2 & BTR', '2x4 Premium', '2x4 Stud',
  // 2x6
  '2x6 #2', '2x6 #2 & BTR', '2x6 Premium', '2x6 Stud',
  // 2x8, 2x10, 2x12
  '2x8 #2', '2x10 #2', '2x12 #2',
  // MSR
  '2x4 1650f MSR', '2x6 1650f MSR',
  // Eastern White Pine
  'EWP 1x4', 'EWP 1x6', 'EWP 1x8'
];

// SPF Lengths
const SPF_LENGTHS = ['8', '10', '12', '14', '16', 'R/L'];
const SPF_STUD_TRIMS = ['92-5/8', '96', '104-5/8', '116-5/8'];

// SPF Origins
const SPF_ORIGINS = ['NORTH', 'SOUTH']; // North = Canada, South = US

// ==================== REGIONS & DESTINATIONS ====================
const REGIONS=['west','central','east'];

// SYP Destinations
const SYP_DESTS=['Atlanta','Charlotte','Dallas','Memphis','Birmingham','Chicago','Houston','Nashville','Jacksonville','New Orleans'];

// SPF Destinations (Northeast/Mid-Atlantic focus)
const SPF_DESTS=['Boston','Hartford','New York','Philadelphia','Baltimore','Richmond','Charlotte','Raleigh','Columbia','Atlanta'];

// Canadian Provinces (for mill origins)
const CANADIAN_PROVINCES = ['QC', 'ON', 'NB', 'NS', 'PE', 'NL', 'AB', 'BC'];

// ==================== MILLS ====================
// SYP Mills (existing)
const SYP_MILLS=['Canfor - DeQuincy','Canfor - Urbana','West Fraser - Huttig','West Fraser - Leola','Interfor - Monticello','Interfor - Georgetown','GP - Clarendon','GP - Camden','Rex Lumber - Bristol','Rex Lumber - Graceville','Weyerhaeuser - Dierks','Tolko - Leland'];

// SPF Mills (Canadian + US reload sources)
const SPF_MILLS = [
  // Canadian Mills
  'Irving Forest Products',
  'NAFP (N. American Forest Products)',
  'Resolute Forest Products',
  'J.D. Irving',
  'Arbec Forest Products',
  'Maibec',
  'Scierie Alexandre Lemay',
  'Groupe Lebel',
  'D&G Forest Products',
  'West Fraser - Edson',
  'Canfor - Grande Prairie',
  'Tolko - High Prairie',
  // Euro Import Sources
  'Centurion Lumber Ltd',
  'International Forest Products',
  'Mercer Timber Products',
  'Binderholz Timber'
];

// ==================== RELOAD FACILITIES ====================
const RELOAD_FACILITIES = [
  { id: 1, name: 'Greater Boston Transload', shortName: 'GBT', location: 'North Billerica, MA', trader: 'Eric S' },
  // Add more reload facilities as needed
];

// ==================== TRANSPORT TYPES ====================
const TRANSPORT_TYPES = {
  rail: { label: 'Rail Car', icon: '🚂', color: 'red', avgMBF: 65 },
  truck: { label: 'Truck', icon: '🚛', color: 'blue', avgMBF: 28 },
  triaxle: { label: 'Tri-Axle', icon: '🚛', color: 'blue', avgMBF: 37 },
  btrain: { label: 'B-Train', icon: '🚛', color: 'blue', avgMBF: 48 },
  tandem: { label: 'Tandem', icon: '🚛', color: 'blue', avgMBF: 28 }
};

// ==================== FREIGHT ====================
// SYP Freight (existing)
const SYP_FREIGHT={west:{Atlanta:96,Charlotte:104,Dallas:40,Memphis:60,Birmingham:85,Chicago:110,Houston:55,Nashville:78},central:{Atlanta:83,Charlotte:91,Dallas:70,Memphis:50,Birmingham:60,Chicago:90,Houston:75,Nashville:55},east:{Atlanta:60,Charlotte:55,Dallas:120,Memphis:80,Birmingham:65,Chicago:84,Houston:115,Nashville:65}};

// SPF Outbound Freight Rates (from N. Billerica reload)
const SPF_OUTBOUND_RATES = {
  'MA': { rate: 1.75, minMiles: 50, minFlat: 450 },
  'NH': { rate: 1.85, minMiles: 50, minFlat: 450 },
  'CT': { rate: 2.00, minMiles: 50, minFlat: 450 },
  'RI': { rate: 1.90, minMiles: 50, minFlat: 450 },
  'VT': { rate: 2.00, minMiles: 75, minFlat: 475 },
  'ME': { rate: 2.10, minMiles: 75, minFlat: 500 },
  'NY': { rate: 2.25, minMiles: 75, minFlat: 500 },
  'NJ': { rate: 2.40, minMiles: 75, minFlat: 500 },
  'PA-E': { rate: 2.50, minMiles: 100, minFlat: 500 },
  'PA-W': { rate: 2.00, minMiles: 100, minFlat: 500 },
  'MD': { rate: 2.00, minMiles: 100, minFlat: 500 },
  'VA': { rate: 1.75, minMiles: 100, minFlat: 500 },
  'NC': { rate: 1.40, minMiles: 100, minFlat: 500 },
  'SC': { rate: 1.50, minMiles: 100, minFlat: 500 },
  'GA': { rate: 1.40, minMiles: 100, minFlat: 500 },
  'TN': { rate: 1.55, minMiles: 100, minFlat: 500 },
  'FL': { rate: 1.60, minMiles: 100, minFlat: 550 }
};

// ==================== ORDER TYPES & MARGIN SPLITS ====================
const ORDER_TYPES = {
  TRANSIT: { label: 'Transit', buySplit: 0.60, sellSplit: 0.40, desc: 'Buyer goes long first' },
  FIRM: { label: 'Firm', buySplit: 0.40, sellSplit: 0.60, desc: 'Back-to-back' },
  SHORT: { label: 'Short', buySplit: 0.40, sellSplit: 0.60, desc: 'Sell before buy' },
  SHARED_TRANS: { label: 'Shared Transit', buySplit: 0.60, sellSplit: 0.40, desc: 'Transit with shared margin' }
};

// Commission tiers (your cut of gross margin)
const COMMISSION_TIERS = [
  { max: 100000, rate: 0.35 },
  { max: 150000, rate: 0.40 },
  { max: Infinity, rate: 0.45 }
];

// ==================== RELOAD COSTS ====================
const RELOAD_COSTS = {
  unloadPerMBF: 10, // $10 per MBF unload cost
  storageAfterDays: 30, // Storage charges start after 30 days
  storageRatePercent: 0.02, // 2% per month after 30 days
  interestRateAnnual: 0.12, // 12% annual interest
  interestChargeDay: 5 // Friday (0=Sun, 5=Fri)
};

// ==================== NAVIGATION ====================
// Mode-aware navigation
const NAV_SYP=[
  {id:'dashboard',icon:'📊',label:'Dashboard'},
  {id:'leaderboard',icon:'🏆',label:'Leaderboard'},
  {id:'insights',icon:'🎯',label:'Daily Briefing'},
  {id:'blotter',icon:'📋',label:'Trade Blotter'},
  {id:'benchmark',icon:'🎯',label:'vs Market'},
  {id:'risk',icon:'⚠️',label:'Risk'},
  {id:'quotes',icon:'💰',label:'Quote Engine'},
  {id:'products',icon:'📦',label:'By Product'},
  {id:'crm',icon:'🏢',label:'CRM'},
  {id:'rldata',icon:'📈',label:'RL Data'},
  {id:'settings',icon:'⚙️',label:'Settings'}
];

const NAV_SPF=[
  {id:'dashboard',icon:'📊',label:'Dashboard'},
  {id:'reload',icon:'📦',label:'Reload Inventory'},
  {id:'transit',icon:'🚛',label:'Transit Inventory'},
  {id:'offers',icon:'📢',label:'Active Offers'},
  {id:'blotter',icon:'📋',label:'Trade Blotter'},
  {id:'margin',icon:'💰',label:'Margin Distribution'},
  {id:'freight',icon:'🚚',label:'Freight Calculator'},
  {id:'crm',icon:'🏢',label:'CRM'},
  {id:'settings',icon:'⚙️',label:'Settings'}
];

// Dynamic NAV based on mode
function getNav() {
  return S.tradingMode === 'spf' ? NAV_SPF : NAV_SYP;
}

// Nav groups for collapsible sidebar
const NAV_GROUPS_SYP=[
  {label:'Trading',items:['dashboard','leaderboard','blotter','quotes']},
  {label:'Relationships',items:['crm','products']},
  {label:'Analytics',items:['insights','benchmark','risk','rldata']},
  {label:'System',items:['settings']}
];

const NAV_GROUPS_SPF=[
  {label:'Trading',items:['dashboard','blotter','margin']},
  {label:'Inventory',items:['reload','transit','offers']},
  {label:'Tools',items:['freight','crm']},
  {label:'System',items:['settings']}
];

function getNavGroups() {
  return S.tradingMode === 'spf' ? NAV_GROUPS_SPF : NAV_GROUPS_SYP;
}

// Dynamic product list based on mode
function getProducts() {
  return S.tradingMode === 'spf' ? SPF_PRODUCTS : SYP_PRODUCTS;
}

// Dynamic mills list based on mode
function getMills() {
  return S.tradingMode === 'spf' ? SPF_MILLS : SYP_MILLS;
}

// Dynamic destinations based on mode
function getDests() {
  return S.tradingMode === 'spf' ? SPF_DESTS : SYP_DESTS;
}

// ==================== LOCAL STORAGE ====================
const LS=(k,d)=>{try{const v=localStorage.getItem('syp_'+k);return v?JSON.parse(v):d}catch{return d}};
const SS=(k,v)=>{try{localStorage.setItem('syp_'+k,JSON.stringify(v))}catch{}};

// ==================== TRADERS ====================
// SYP Traders
const SYP_TRADERS=['Ian P','Aubrey M','Hunter S','Sawyer R','Jackson M','John W'];
// SPF Traders
const SPF_TRADERS=['Eric S','Jake T','Spencer M','Josh K'];
// All traders
const TRADERS=[...new Set([...SYP_TRADERS,...SPF_TRADERS])];
const ALL_LOGINS=['Admin',...TRADERS];

// CSV full names → trader profiles
const TRADER_MAP={
  'Ian Plank':'Ian P','Aubrey Milligan':'Aubrey M','Sawyer Rapp':'Sawyer R',
  'Jackson McCormick':'Jackson M','Hunter Sweet':'Hunter S',
  'Eric Saylor':'Eric S','Jake Thompson':'Jake T','Spencer McKinnon':'Spencer M','Josh Kemps':'Josh K'
};
const LEGACY_TRADER={'Ian':'Ian P','Aubrey':'Aubrey M','Hunter':'Hunter S','Sawyer':'Sawyer R','Jackson':'Jackson M','Eric':'Eric S','Jake':'Jake T','Spencer':'Spencer M'};
function normalizeTrader(t){if(!t)return t;if(TRADERS.includes(t)||t==='Admin')return t;return LEGACY_TRADER[t]||TRADER_MAP[t]||null;}

// ==================== MAIN STATE OBJECT ====================
let S={
  // Core
  view:'dashboard',
  tradingMode:LS('tradingMode','spf'), // 'syp' or 'spf' - default to SPF for Eric
  filters:{date:'30d',prod:'all',reg:'all'},
  
  // Trade Data
  buys:LS('buys',[]),
  sells:LS('sells',[]),
  rl:LS('rl',[]),
  
  // CRM
  customers:LS('customers',[]),
  mills:LS('mills',[]),
  
  // ==================== SPF-SPECIFIC STATE ====================
  // Reload Inventory
  reloadInventory:LS('reloadInventory',[]), // Items at reload, by receipt
  reloadFacility:LS('reloadFacility', RELOAD_FACILITIES[0]), // Current reload facility
  
  // Inbound Tracking
  inboundShipments:LS('inboundShipments',[]), // Rail cars & trucks coming in
  
  // Transit Inventory (offered to floor)
  transitInventory:LS('transitInventory',[]),
  
  // Active Offers
  activeOffers:LS('activeOffers',[]),
  
  // Outbound Trucks
  outboundTrucks:LS('outboundTrucks',[]),
  
  // Mill Freight Rates (predefined by mill)
  millFreightRates:LS('millFreightRates',{}),
  
  // Offer History
  offerHistory:LS('offerHistory',[]),
  
  // ==================== END SPF-SPECIFIC ====================
  
  // System
  nextId:LS('nextId',1),
  apiKey:LS('apiKey',''),
  aiMsgs:LS('aiMsgs',[]),
  aiPanelOpen:LS('aiPanelOpen',false),
  flatRate:LS('flatRate',3.50),
  autoSync:LS('autoSync',false),
  lanes:LS('lanes',[]),
  
  // Quote Engine
  quoteItems:LS('quoteItems',[]),
  quoteMode:'known',
  quoteMBFperTL:LS('quoteMBFperTL',23), // SYP default
  spfMBFperTL:LS('spfMBFperTL',28), // SPF default
  quoteMSRFootage:false,
  stateRates:LS('stateRates',{AR:2.25,LA:2.25,TX:2.50,MS:2.25,AL:2.50,FL:2.75,GA:2.50,SC:2.50,NC:2.50}),
  spfStateRates:LS('spfStateRates', SPF_OUTBOUND_RATES),
  quoteProfiles:LS('quoteProfiles',{default:{name:'Default',customers:[]}}),
  quoteProfile:LS('quoteProfile','default'),
  marketBlurb:LS('marketBlurb',''),
  shortHaulFloor:LS('shortHaulFloor',0),
  freightBase:LS('freightBase',450),
  singleQuoteCustomer:'',
  chartProduct:'2x4#2',
  
  // User
  trader:LS('trader','Eric S'), // Default to SPF trader
  
  // Leaderboard & Goals
  leaderboardPeriod:LS('leaderboardPeriod','30d'),
  traderGoals:LS('traderGoals',{}),
  achievements:LS('achievements',[]),
  
  // UI
  crmViewMode:LS('crmViewMode','table'),
  sidebarCollapsed:LS('sidebarCollapsed',false),
  
  // SPF-specific UI state
  reloadViewMode:LS('reloadViewMode','summary'), // 'summary' or 'detail'
  selectedSKU:null,
  reloadFilter:LS('reloadFilter',{product:'all',origin:'all'}),
  transitFilter:LS('transitFilter',{dept:'all',status:'all'})
};

// ==================== FORMATTERS ====================
const fmt=(v,d=0)=>v!=null&&!isNaN(v)?`$${Number(v).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d})}`:'—';
const fmtN=v=>v!=null&&!isNaN(v)?parseFloat(Number(v).toFixed(2)):'—';
const fmtPct=v=>v!=null&&!isNaN(v)?`${v>=0?'+':''}${Number(v).toFixed(1)}%`:'—';
const fmtD=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—';
const today=()=>new Date().toISOString().split('T')[0];

// ==================== TRADER MIGRATION ====================
function migrateTraderNames(){
  let changed=false;
  const nt=normalizeTrader(S.trader);
  if(nt&&nt!==S.trader){S.trader=nt;SS('trader',nt);changed=true;}
  S.buys.forEach(b=>{const n=normalizeTrader(b.trader);if(n&&n!==b.trader){b.trader=n;changed=true;}});
  S.sells.forEach(s=>{const n=normalizeTrader(s.trader);if(n&&n!==s.trader){s.trader=n;changed=true;}});
  S.mills.forEach(m=>{const n=normalizeTrader(m.trader);if(n&&n!==m.trader){m.trader=n;changed=true;}});
  S.customers.forEach(c=>{const n=normalizeTrader(c.trader);if(n&&n!==c.trader){c.trader=n;changed=true;}});
  if(changed){SS('buys',S.buys);SS('sells',S.sells);SS('mills',S.mills);SS('customers',S.customers);}
}
migrateTraderNames();
const genId=()=>{const id=S.nextId++;SS('nextId',S.nextId);return id};

// ==================== MODE SWITCHING ====================
function setTradingMode(mode) {
  if (!TRADING_MODES.includes(mode)) return;
  S.tradingMode = mode;
  SS('tradingMode', mode);
  
  // Update MBF per TL based on mode
  if (mode === 'spf') {
    S.quoteMBFperTL = S.spfMBFperTL;
  } else {
    S.quoteMBFperTL = 23; // SYP default
  }
  
  // Reset view to dashboard
  S.view = 'dashboard';
  
  showToast(`Switched to ${mode.toUpperCase()} mode`, 'info');
  render();
}

// ==================== SPF HELPER FUNCTIONS ====================

// Calculate days at reload (OTG = On The Ground)
function calcDaysOTG(dateOTG) {
  if (!dateOTG) return 0;
  const otg = new Date(dateOTG);
  const now = new Date();
  return Math.floor((now - otg) / (1000 * 60 * 60 * 24));
}

// Calculate interest accrued on reload inventory
function calcInterest(costValue, daysOTG) {
  const dailyRate = RELOAD_COSTS.interestRateAnnual / 365;
  return costValue * dailyRate * daysOTG;
}

// Calculate landed cost at reload
function calcLandedCost(buyPrice, inboundFreight, volume) {
  const unloadCost = RELOAD_COSTS.unloadPerMBF * volume;
  return (buyPrice * volume) + inboundFreight + unloadCost;
}

// Calculate outbound freight
function calcOutboundFreight(destState, miles, volumeMBF) {
  const rates = S.spfStateRates[destState] || { rate: 2.00, minMiles: 100, minFlat: 500 };
  if (miles <= rates.minMiles) {
    return rates.minFlat;
  }
  return miles * rates.rate;
}

// Calculate margin for SPF two-leg model
function calcSPFMargin(buy, sell) {
  // Buy side: FOB Mill + Inbound Freight = Landed at Reload
  const landedCost = buy.price + (buy.inboundFreight || 0) + RELOAD_COSTS.unloadPerMBF;
  
  // Sell side: Sell Price - Outbound Freight = FOB Reload
  const fobReload = sell.price - (sell.outboundFreight || 0) / sell.volume;
  
  // Margin per MBF
  const marginPerMBF = fobReload - landedCost;
  
  // Total margin
  const totalMargin = marginPerMBF * sell.volume;
  
  return { landedCost, fobReload, marginPerMBF, totalMargin };
}

// Calculate commission based on tiers
function calcCommission(grossMargin) {
  let remaining = grossMargin;
  let commission = 0;
  let prevMax = 0;
  
  for (const tier of COMMISSION_TIERS) {
    const tierAmount = Math.min(remaining, tier.max - prevMax);
    if (tierAmount <= 0) break;
    commission += tierAmount * tier.rate;
    remaining -= tierAmount;
    prevMax = tier.max;
  }
  
  return commission;
}

// Group reload inventory by SKU
function groupReloadBySKU() {
  const skus = {};
  
  S.reloadInventory.forEach(receipt => {
    const skuKey = `${receipt.product}|${receipt.length}|${receipt.grade}|${receipt.origin}`;
    
    if (!skus[skuKey]) {
      skus[skuKey] = {
        product: receipt.product,
        length: receipt.length,
        grade: receipt.grade,
        origin: receipt.origin,
        receipts: [],
        totalUnits: 0,
        totalRemaining: 0,
        totalCostValue: 0
      };
    }
    
    const daysOTG = calcDaysOTG(receipt.dateOTG);
    const interest = calcInterest(receipt.remaining * receipt.costOTG, daysOTG);
    
    skus[skuKey].receipts.push({
      ...receipt,
      daysOTG,
      interest
    });
    skus[skuKey].totalUnits += receipt.units || 0;
    skus[skuKey].totalRemaining += receipt.remaining || 0;
    skus[skuKey].totalCostValue += (receipt.remaining || 0) * (receipt.costOTG || 0);
  });
  
  // Calculate averages and OTG trucks
  Object.values(skus).forEach(sku => {
    sku.avgCost = sku.totalRemaining > 0 ? Math.round(sku.totalCostValue / sku.totalRemaining) : 0;
    sku.otgTrucks = (sku.totalRemaining / (S.spfMBFperTL || 28)).toFixed(1);
    sku.totalInterest = sku.receipts.reduce((sum, r) => sum + (r.interest || 0), 0);
  });
  
  return skus;
}

// ==================== ACHIEVEMENTS ====================
const ACHIEVEMENTS=[
  {id:'first_trade',name:'First Trade',icon:'🎯',desc:'Complete your first trade',check:s=>s.trades>=1},
  {id:'vol_100',name:'Century Club',icon:'💯',desc:'Trade 100 MBF total volume',check:s=>s.totalVol>=100},
  {id:'vol_500',name:'High Roller',icon:'🎰',desc:'Trade 500 MBF total volume',check:s=>s.totalVol>=500},
  {id:'vol_1000',name:'Volume King',icon:'👑',desc:'Trade 1,000 MBF total volume',check:s=>s.totalVol>=1000},
  {id:'profit_10k',name:'Money Maker',icon:'💰',desc:'Earn $10,000 profit',check:s=>s.profit>=10000},
  {id:'profit_50k',name:'Big Earner',icon:'💎',desc:'Earn $50,000 profit',check:s=>s.profit>=50000},
  {id:'profit_100k',name:'Six Figures',icon:'🏆',desc:'Earn $100,000 profit',check:s=>s.profit>=100000},
  {id:'margin_50',name:'Margin Master',icon:'📈',desc:'Achieve $50+/MBF margin',check:s=>s.margin>=50},
  {id:'margin_100',name:'Margin Legend',icon:'🌟',desc:'Achieve $100+/MBF margin',check:s=>s.margin>=100},
  {id:'win_80',name:'Sharp Shooter',icon:'🎯',desc:'80%+ win rate (min 10 sells)',check:s=>s.winRate>=80&&s.sells>=10},
  {id:'win_90',name:'Sniper',icon:'🔫',desc:'90%+ win rate (min 10 sells)',check:s=>s.winRate>=90&&s.sells>=10},
  {id:'customers_5',name:'Networker',icon:'🤝',desc:'Sell to 5 different customers',check:s=>s.customerCount>=5},
  {id:'customers_10',name:'Rainmaker',icon:'🌧️',desc:'Sell to 10 different customers',check:s=>s.customerCount>=10},
  {id:'trades_50',name:'Active Trader',icon:'⚡',desc:'Complete 50 trades',check:s=>s.trades>=50},
  {id:'trades_100',name:'Trading Machine',icon:'🤖',desc:'Complete 100 trades',check:s=>s.trades>=100},
  {id:'best_5k',name:'Big Fish',icon:'🐟',desc:'Single trade with $5,000+ profit',check:s=>s.bestProfit>=5000},
  {id:'best_10k',name:'Whale Hunter',icon:'🐋',desc:'Single trade with $10,000+ profit',check:s=>s.bestProfit>=10000},
  // SPF-specific achievements
  {id:'reload_master',name:'Reload Master',icon:'📦',desc:'Move 500+ MBF through reload',check:s=>s.reloadVolume>=500},
  {id:'quick_turn',name:'Quick Turn',icon:'⚡',desc:'Average <14 days at reload',check:s=>s.avgDaysOTG>0&&s.avgDaysOTG<14},
  {id:'rail_king',name:'Rail King',icon:'🚂',desc:'Unload 50+ rail cars',check:s=>s.railCarsUnloaded>=50}
];

function checkAchievements(traderName,stats){
  const earned=[];
  const existing=S.achievements.filter(a=>a.trader===traderName);
  ACHIEVEMENTS.forEach(ach=>{
    if(ach.check(stats)&&!existing.find(e=>e.id===ach.id)){
      earned.push({...ach,trader:traderName,earnedAt:new Date().toISOString()});
    }
  });
  if(earned.length>0){
    S.achievements=[...S.achievements,...earned];
    SS('achievements',S.achievements);
  }
  return[...existing,...earned];
}
