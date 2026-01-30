// SYP Analytics - SPF/Spruce Views
// Renders reload inventory, transit inventory, offers, margin distribution, and freight calculator

// ==================== RELOAD INVENTORY VIEW ====================

function renderReloadView() {
  const stats = getReloadStats();
  const skus = stats.skus;
  const filter = S.reloadFilter || { product: 'all', origin: 'all' };
  
  // Get unique products for filter
  const products = [...new Set(Object.values(skus).map(s => s.product))];
  
  // Filter SKUs
  const filteredSKUs = Object.entries(skus).filter(([key, sku]) => {
    if (filter.product !== 'all' && sku.product !== filter.product) return false;
    if (filter.origin !== 'all' && sku.origin !== filter.origin) return false;
    return true;
  });
  
  // Group by product for display
  const byProduct = {};
  filteredSKUs.forEach(([key, sku]) => {
    if (!byProduct[sku.product]) byProduct[sku.product] = [];
    byProduct[sku.product].push({ key, ...sku });
  });
  
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div>
        <h2 style="margin:0;color:var(--text)">📦 Reload Inventory</h2>
        <div style="color:var(--muted);font-size:12px">${S.reloadFacility?.name || 'Greater Boston Transload'} — ${fmtD(today())}</div>
      </div>
      <div style="display:flex;gap:8px">
        <select onchange="S.reloadFilter.product=this.value;render()" style="padding:6px 10px">
          <option value="all">All Products</option>
          ${products.map(p => `<option value="${p}" ${filter.product === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
        <select onchange="S.reloadFilter.origin=this.value;render()" style="padding:6px 10px">
          <option value="all">All Origins</option>
          <option value="NORTH" ${filter.origin === 'NORTH' ? 'selected' : ''}>🍁 NORTH</option>
          <option value="SOUTH" ${filter.origin === 'SOUTH' ? 'selected' : ''}>🇺🇸 SOUTH</option>
        </select>
        <button class="btn btn-success" onclick="showReloadReceiptModal()">+ Add Receipt</button>
      </div>
    </div>
    
    <!-- Stats -->
    <div class="kpi-grid" style="margin-bottom:20px">
      <div class="kpi">
        <div class="kpi-label">UNITS OTG</div>
        <div class="kpi-value">${stats.totalRemaining}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">OTG TRUCKS</div>
        <div class="kpi-value positive">${stats.otgTrucks}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">INVENTORY VALUE</div>
        <div class="kpi-value">${fmt(stats.totalValue)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">AVG DAYS OTG</div>
        <div class="kpi-value ${stats.avgDaysOTG > 30 ? 'warn' : ''}">${stats.avgDaysOTG}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">INTEREST ACCRUED</div>
        <div class="kpi-value ${stats.totalInterest > 500 ? 'negative' : ''}">${fmt(stats.totalInterest)}</div>
        <div class="kpi-sub">12% annual, charged Fri</div>
      </div>
    </div>
    
    <!-- In Transit Summary -->
    ${stats.inTransitRail + stats.inTransitTruck > 0 ? `
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><span class="card-title">🚛 In Transit</span></div>
        <div class="card-body" style="display:flex;gap:24px">
          <div><span style="color:var(--muted)">Rail Cars:</span> <span style="font-weight:600;color:var(--negative)">${stats.inTransitRail}</span></div>
          <div><span style="color:var(--muted)">Trucks:</span> <span style="font-weight:600;color:var(--info)">${stats.inTransitTruck}</span></div>
        </div>
      </div>
    ` : ''}
    
    <!-- Inventory by Product -->
    ${Object.entries(byProduct).map(([product, productSKUs]) => `
      <div class="card" style="margin-bottom:16px">
        <div class="card-header">
          <span class="card-title">${product}</span>
          <span style="color:var(--muted);font-size:11px">${productSKUs.reduce((s, sku) => s + sku.totalRemaining, 0)} units | ${productSKUs.reduce((s, sku) => s + parseFloat(sku.otgTrucks), 0).toFixed(1)} TLs</span>
        </div>
        <div class="card-body" style="padding:0">
          <table class="tbl">
            <thead>
              <tr>
                <th>SKU</th>
                <th style="text-align:center">Origin</th>
                <th style="text-align:right">Total</th>
                <th style="text-align:right;color:var(--positive)">Remaining</th>
                <th style="text-align:right;color:var(--positive)">OTG TLs</th>
                <th style="text-align:right">Avg Cost</th>
                <th style="text-align:center">Receipts</th>
                <th style="text-align:center">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${productSKUs.map(sku => `
                <tr class="${S.selectedSKU === sku.key ? 'selected' : ''}" style="cursor:pointer" onclick="toggleSKUDetail('${sku.key}')">
                  <td style="font-weight:600"><span style="margin-right:4px">${S.selectedSKU === sku.key ? '▼' : '▶'}</span>${sku.length} ${sku.grade}</td>
                  <td style="text-align:center">
                    <span class="badge ${sku.origin === 'NORTH' ? 'info' : 'warn'}" style="font-size:10px">${sku.origin === 'NORTH' ? '🍁' : '🇺🇸'} ${sku.origin}</span>
                  </td>
                  <td style="text-align:right;color:var(--muted)">${sku.totalUnits}</td>
                  <td style="text-align:right;font-weight:600;color:var(--positive)">${sku.totalRemaining}</td>
                  <td style="text-align:right;color:var(--positive)">${sku.otgTrucks}</td>
                  <td style="text-align:right;color:var(--warn)">${fmt(sku.avgCost)}</td>
                  <td style="text-align:center;color:var(--muted)">${sku.receipts.length}</td>
                  <td style="text-align:center">
                    ${parseFloat(sku.otgTrucks) > 0 ? `<button class="btn btn-success btn-sm" onclick="event.stopPropagation();showOfferBuilderModal({product:'${sku.product}',length:'${sku.length}',grade:'${sku.grade}',origin:'${sku.origin}',avgCost:${sku.avgCost},totalRemaining:${sku.totalRemaining},otgTrucks:'${sku.otgTrucks}'})">Offer</button>` : ''}
                  </td>
                </tr>
                ${S.selectedSKU === sku.key ? renderSKUDetailRows(sku) : ''}
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `).join('')}
    
    ${Object.keys(byProduct).length === 0 ? `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <div style="font-size:48px;margin-bottom:16px">📦</div>
            <h3>No Reload Inventory</h3>
            <p>Add your first receipt to start tracking inventory at the reload.</p>
            <button class="btn btn-success" onclick="showReloadReceiptModal()">+ Add Receipt</button>
          </div>
        </div>
      </div>
    ` : ''}
  `;
}

function renderSKUDetailRows(sku) {
  return `
    <tr>
      <td colspan="8" style="padding:0;background:var(--panel-alt)">
        <table class="tbl" style="font-size:11px">
          <thead>
            <tr>
              <th>Car/Truck #</th>
              <th>PO Date</th>
              <th>Mill</th>
              <th>Inbound #</th>
              <th>Date OTG</th>
              <th style="text-align:right">Days</th>
              <th style="text-align:right">Units</th>
              <th style="text-align:right">Cost</th>
              <th style="text-align:right">Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${sku.receipts.map(r => `
              <tr style="${r.remaining === 0 ? 'opacity:0.5' : ''} ${r.daysOTG > 30 ? 'background:rgba(251,191,36,0.1)' : ''}">
                <td style="font-family:monospace">${r.carNumber || '—'}</td>
                <td>${fmtD(r.poDate)}</td>
                <td>${r.mill || '—'}</td>
                <td style="color:var(--info)">${r.poNumber || '—'}</td>
                <td>${fmtD(r.dateOTG)}</td>
                <td style="text-align:right;${r.daysOTG > 30 ? 'color:var(--warn);font-weight:600' : ''}">${r.daysOTG || '—'}</td>
                <td style="text-align:right">${r.units || 0}</td>
                <td style="text-align:right;color:var(--warn)">${fmt(r.costOTG)}</td>
                <td style="text-align:right;font-weight:600;${r.remaining > 0 ? 'color:var(--positive)' : 'color:var(--muted)'}">${r.remaining || 0}</td>
                <td>
                  <button class="btn btn-default btn-sm" onclick="event.stopPropagation();showReloadReceiptModal({id:${r.id},poNumber:'${r.poNumber||''}',poDate:'${r.poDate||''}',mill:'${r.mill||''}',transportType:'${r.transportType||'rail'}',carNumber:'${r.carNumber||''}',origin:'${r.origin||'NORTH'}',product:'${r.product}',length:'${r.length}',grade:'${r.grade}',units:${r.units||0},costOTG:${r.costOTG||0},inboundFreight:${r.inboundFreight||0},status:'${r.status||'unloaded'}',dateOTG:'${r.dateOTG||''}',notes:'${(r.notes||'').replace(/'/g, "\\'")}',remaining:${r.remaining||0}})">Edit</button>
                  ${r.status === 'in_transit' ? `<button class="btn btn-success btn-sm" onclick="event.stopPropagation();markReceiptArrived(${r.id})">Arrived</button>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </td>
    </tr>
  `;
}

function toggleSKUDetail(key) {
  S.selectedSKU = S.selectedSKU === key ? null : key;
  render();
}

// ==================== TRANSIT INVENTORY VIEW ====================

function renderTransitView() {
  const filter = S.transitFilter || { dept: 'all', status: 'all' };
  
  let filtered = S.transitInventory || [];
  if (filter.dept !== 'all') {
    filtered = filtered.filter(t => t.dept === filter.dept);
  }
  if (filter.status === 'available') {
    filtered = filtered.filter(t => !t.sold && !t.hidden);
  } else if (filter.status === 'sold') {
    filtered = filtered.filter(t => t.sold);
  } else if (filter.status === 'hidden') {
    filtered = filtered.filter(t => t.hidden);
  }
  
  const depts = [...new Set((S.transitInventory || []).map(t => t.dept))];
  const availableCount = (S.transitInventory || []).filter(t => !t.sold && !t.hidden).length;
  const soldCount = (S.transitInventory || []).filter(t => t.sold).length;
  const hiddenCount = (S.transitInventory || []).filter(t => t.hidden && !t.sold).length;
  
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div>
        <h2 style="margin:0;color:var(--text)">🚛 Transit Inventory</h2>
        <div style="color:var(--muted);font-size:12px">Items available for floor to sell</div>
      </div>
      <div style="display:flex;gap:8px">
        <select onchange="S.transitFilter.dept=this.value;render()" style="padding:6px 10px">
          <option value="all">All Depts</option>
          ${depts.map(d => `<option value="${d}" ${filter.dept === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
        <select onchange="S.transitFilter.status=this.value;render()" style="padding:6px 10px">
          <option value="all">All Status</option>
          <option value="available" ${filter.status === 'available' ? 'selected' : ''}>Available</option>
          <option value="sold" ${filter.status === 'sold' ? 'selected' : ''}>Sold</option>
          <option value="hidden" ${filter.status === 'hidden' ? 'selected' : ''}>Hidden</option>
        </select>
      </div>
    </div>
    
    <div class="grid-3" style="margin-bottom:20px">
      <div class="kpi">
        <div class="kpi-label">AVAILABLE</div>
        <div class="kpi-value positive">${availableCount}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">SOLD</div>
        <div class="kpi-value">${soldCount}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">HIDDEN</div>
        <div class="kpi-value warn">${hiddenCount}</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-body" style="padding:0">
        <table class="tbl" style="font-size:11px">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Dept</th>
              <th style="text-align:center">Trans</th>
              <th style="text-align:center">Sold</th>
              <th style="text-align:center">Hidden</th>
              <th style="text-align:right">Cost</th>
              <th style="text-align:right;color:var(--positive)">Ask</th>
              <th>Product</th>
              <th>Origin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length > 0 ? filtered.map(item => `
              <tr style="${item.sold ? 'background:rgba(34,197,94,0.1)' : ''} ${item.hidden ? 'opacity:0.5' : ''}">
                <td style="color:var(--info)">${item.orderNum}</td>
                <td>${item.dept}</td>
                <td style="text-align:center">
                  <span class="badge ${item.trans === 'rail' ? 'negative' : 'info'}" style="font-size:10px">
                    ${item.trans === 'rail' ? '🚂' : '🚛'}
                  </span>
                </td>
                <td style="text-align:center">${item.sold ? '<span style="color:var(--positive)">✓</span>' : ''}</td>
                <td style="text-align:center">${item.hidden ? '<span style="color:var(--warn)">✓</span>' : ''}</td>
                <td style="text-align:right;color:var(--muted)">${fmt(item.price)}</td>
                <td style="text-align:right;font-weight:600;color:var(--positive)">${fmt(item.askPrice)}</td>
                <td>${item.descHeader} ${item.descDetail}</td>
                <td>${item.originCity}, ${item.originState}</td>
                <td>
                  <button class="btn btn-default btn-sm" onclick="showTransitPricingModal({id:${item.id},orderNum:'${item.orderNum}',descHeader:'${item.descHeader}',descDetail:'${item.descDetail}',name:'${item.name}',price:${item.price},askPrice:${item.askPrice},hidden:${item.hidden},askNote:'${item.askNote||''}',targetMarket:'${item.targetMarket||''}',adderList:'${item.adderList||''}',notes:'${(item.notes||'').replace(/'/g, "\\'")}'})">Price</button>
                </td>
              </tr>
            `).join('') : `
              <tr><td colspan="10" style="text-align:center;padding:40px;color:var(--muted)">No transit inventory matching filters</td></tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
    
    <div style="display:flex;gap:24px;margin-top:12px;font-size:11px;color:var(--muted)">
      <div><span class="badge negative" style="font-size:10px">🚂</span> Rail</div>
      <div><span class="badge info" style="font-size:10px">🚛</span> Truck</div>
      <div><span style="color:var(--positive)">✓</span> Sold = Claimed</div>
      <div><span style="color:var(--warn)">✓</span> Hidden = Not visible</div>
    </div>
  `;
}

// ==================== ACTIVE OFFERS VIEW ====================

function renderOffersView() {
  const offers = S.activeOffers || [];
  const activeCount = offers.filter(o => o.status === 'active' && !o.hidden).length;
  const pausedCount = offers.filter(o => o.hidden).length;
  
  const byProduct = {};
  offers.forEach(o => {
    if (!byProduct[o.product]) byProduct[o.product] = [];
    byProduct[o.product].push(o);
  });
  
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div>
        <h2 style="margin:0;color:var(--text)">📢 Active Offers</h2>
        <div style="color:var(--muted);font-size:12px">Your inventory visible to the floor</div>
      </div>
      <button class="btn btn-success" onclick="go('reload')">+ Create from Inventory</button>
    </div>
    
    <div class="grid-3" style="margin-bottom:20px">
      <div class="kpi">
        <div class="kpi-label">ACTIVE OFFERS</div>
        <div class="kpi-value positive">${activeCount}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">TOTAL TLs OFFERED</div>
        <div class="kpi-value">${offers.reduce((s, o) => s + parseFloat(o.availableTLs || 0), 0).toFixed(1)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">PAUSED/HIDDEN</div>
        <div class="kpi-value warn">${pausedCount}</div>
      </div>
    </div>
    
    ${Object.entries(byProduct).map(([product, productOffers]) => `
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><span class="card-title">${product}</span></div>
        <div class="card-body" style="padding:0">
          <table class="tbl">
            <thead>
              <tr>
                <th>SKU</th>
                <th style="text-align:center">Origin</th>
                <th style="text-align:right;color:var(--positive)">Price</th>
                <th style="text-align:center">Available</th>
                <th>Ship Notes</th>
                <th>Adders</th>
                <th style="text-align:right">Margin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${productOffers.map(o => `
                <tr style="${o.hidden ? 'opacity:0.5' : ''}">
                  <td style="font-weight:600">${o.length} ${o.grade}</td>
                  <td style="text-align:center">
                    <span class="badge ${o.origin === 'NORTH' ? 'info' : 'warn'}" style="font-size:10px">${o.origin}</span>
                  </td>
                  <td style="text-align:right;font-weight:600;color:var(--positive)">${fmt(o.askPrice)}</td>
                  <td style="text-align:center">${o.availableTLs}</td>
                  <td style="color:var(--muted)">${o.shipNotes || '—'}</td>
                  <td style="color:var(--muted)">${o.freightAdder || '—'}</td>
                  <td style="text-align:right;color:var(--positive)">${fmt(o.targetMargin)}</td>
                  <td>
                    <button class="btn btn-default btn-sm" onclick="editOffer(${o.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="closeOffer(${o.id},'manual')">Close</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `).join('')}
    
    ${offers.length === 0 ? `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <div style="font-size:48px;margin-bottom:16px">📢</div>
            <h3>No Active Offers</h3>
            <p>Create offers from your reload inventory.</p>
            <button class="btn btn-success" onclick="go('reload')">Go to Reload Inventory</button>
          </div>
        </div>
      </div>
    ` : ''}
  `;
}

// ==================== MARGIN DISTRIBUTION VIEW ====================

function renderMarginView() {
  const stats = getMarginStats(S.leaderboardPeriod || '30d');
  
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div>
        <h2 style="margin:0;color:var(--text)">💰 Margin Distribution</h2>
        <div style="color:var(--muted);font-size:12px">Buy/sell margin splits</div>
      </div>
      <select onchange="S.leaderboardPeriod=this.value;render()" style="padding:6px 10px">
        <option value="7d" ${S.leaderboardPeriod === '7d' ? 'selected' : ''}>Last 7 days</option>
        <option value="30d" ${S.leaderboardPeriod === '30d' ? 'selected' : ''}>Last 30 days</option>
        <option value="90d" ${S.leaderboardPeriod === '90d' ? 'selected' : ''}>Last 90 days</option>
      </select>
    </div>
    
    <div class="kpi-grid" style="margin-bottom:20px">
      <div class="kpi">
        <div class="kpi-label">BUY TOTAL</div>
        <div class="kpi-value">${fmt(stats.buyTotal)}</div>
        <div class="kpi-sub">${stats.buyCount} orders</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">SELL TOTAL</div>
        <div class="kpi-value">${fmt(stats.sellTotal)}</div>
        <div class="kpi-sub">${stats.sellCount} orders</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">GROSS MARGIN</div>
        <div class="kpi-value ${stats.grossMargin >= 0 ? 'positive' : 'negative'}">${fmt(stats.grossMargin)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">COMP BASIS</div>
        <div class="kpi-value positive">${fmt(stats.compBasis)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">EST COMMISSION</div>
        <div class="kpi-value positive">${fmt(stats.estCommission)}</div>
        <div class="kpi-sub">35-45% tiered</div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><span class="card-title">Commission Structure</span></div>
      <div class="card-body">
        <div class="grid-2">
          <div>
            <h4 style="color:var(--muted);font-size:11px;margin-bottom:8px">ORDER TYPE SPLITS</h4>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <span>TRANSIT (Buyer goes long)</span>
              <span style="font-family:monospace">60% Buy / 40% Sell</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <span>FIRM (Back-to-back)</span>
              <span style="font-family:monospace">40% Buy / 60% Sell</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0">
              <span>SHORT (Sell before buy)</span>
              <span style="font-family:monospace">40% Buy / 60% Sell</span>
            </div>
          </div>
          <div>
            <h4 style="color:var(--muted);font-size:11px;margin-bottom:8px">YOUR CUT OF GROSS MARGIN</h4>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <span>First $100,000</span>
              <span style="font-family:monospace;color:var(--positive)">35%</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <span>$100,000 - $150,000</span>
              <span style="font-family:monospace;color:var(--positive)">40%</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0">
              <span>Over $150,000</span>
              <span style="font-family:monospace;color:var(--positive)">45%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==================== FREIGHT CALCULATOR VIEW ====================

function renderFreightView() {
  const rates = S.spfStateRates || SPF_OUTBOUND_RATES;
  
  return `
    <div style="margin-bottom:16px">
      <h2 style="margin:0;color:var(--text)">🚚 Outbound Freight Calculator</h2>
      <div style="color:var(--muted);font-size:12px">Calculate freight from ${S.reloadFacility?.name || 'N. Billerica Reload'}</div>
    </div>
    
    <div class="card" style="margin-bottom:16px">
      <div class="card-header"><span class="card-title info">SPF Load Info</span></div>
      <div class="card-body">
        <p style="color:var(--muted);margin:0">
          SPF loads approximately <strong>${S.spfMBFperTL || 28} MBF</strong> per truck.
          Short hauls (&lt;100 miles) typically have a flat minimum of $400-500.
        </p>
      </div>
    </div>
    
    <div class="card" style="margin-bottom:16px">
      <div class="card-header"><span class="card-title">Per-Mile Rates by State</span></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">
          ${Object.entries(rates).map(([state, data]) => `
            <div style="background:var(--panel-alt);border-radius:4px;padding:8px;text-align:center">
              <div style="color:var(--muted);font-size:10px">${state}</div>
              <div style="color:var(--positive);font-weight:600">$${(data.rate || 2.00).toFixed(2)}/mi</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><span class="card-title">Calculate Freight</span></div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Destination State</label>
            <select id="calc-state" onchange="calcFreightPreview()">
              ${Object.keys(rates).map(st => `<option value="${st}">${st}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Miles from Reload</label>
            <input type="number" id="calc-miles" value="450" oninput="calcFreightPreview()">
          </div>
          <div class="form-group">
            <label class="form-label">Volume (MBF)</label>
            <input type="number" id="calc-volume" value="${S.spfMBFperTL || 28}" oninput="calcFreightPreview()">
          </div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:16px;padding:16px;background:var(--panel-alt);border-radius:4px">
          <div style="text-align:center">
            <div style="color:var(--muted);font-size:11px">Per Load</div>
            <div id="calc-perload" style="font-size:24px;font-weight:700;color:var(--positive)">$630</div>
          </div>
          <div style="text-align:center">
            <div style="color:var(--muted);font-size:11px">Per MBF</div>
            <div id="calc-permbf" style="font-size:24px;font-weight:700;color:var(--positive)">$23</div>
          </div>
          <div style="text-align:center">
            <div style="color:var(--muted);font-size:11px">Rate Used</div>
            <div id="calc-rate" style="font-size:24px;font-weight:700;color:var(--warn)">$1.40/mi</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function calcFreightPreview() {
  const state = document.getElementById('calc-state')?.value;
  const miles = parseFloat(document.getElementById('calc-miles')?.value) || 0;
  const volume = parseFloat(document.getElementById('calc-volume')?.value) || 28;
  
  const rates = S.spfStateRates || SPF_OUTBOUND_RATES;
  const stateRate = rates[state] || { rate: 2.00, minMiles: 100, minFlat: 500 };
  
  let perLoad = miles <= (stateRate.minMiles || 100) ? (stateRate.minFlat || 500) : miles * stateRate.rate;
  const perMBF = Math.round(perLoad / volume);
  
  if (document.getElementById('calc-perload')) {
    document.getElementById('calc-perload').textContent = fmt(Math.round(perLoad));
    document.getElementById('calc-permbf').textContent = fmt(perMBF);
    document.getElementById('calc-rate').textContent = `$${stateRate.rate.toFixed(2)}/mi`;
  }
}

// ==================== SPF DASHBOARD ====================

function renderSPFDashboard() {
  const reloadStats = getReloadStats();
  const marginStats = getMarginStats('30d');
  
  const inTransitRail = S.reloadInventory.filter(r => r.status === 'in_transit' && r.transportType === 'rail').length;
  const inTransitTruck = S.reloadInventory.filter(r => r.status === 'in_transit' && r.transportType !== 'rail').length;
  const activeOffers = (S.activeOffers || []).filter(o => o.status === 'active' && !o.hidden).length;
  
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <div>
        <h2 style="margin:0;color:var(--text)">📊 SPF Trading Dashboard</h2>
        <div style="color:var(--muted);font-size:12px">${S.trader} • ${S.reloadFacility?.name || 'E. Canadian Dept'}</div>
      </div>
      <div style="text-align:right">
        <div style="color:var(--muted);font-size:11px">${new Date().toLocaleDateString('en-US', {month:'long', year:'numeric'})}</div>
        <div style="color:var(--positive);font-weight:700">Gross Margin: ${fmt(marginStats.grossMargin)}</div>
      </div>
    </div>
    
    <div class="kpi-grid" style="margin-bottom:20px">
      <div class="kpi" onclick="go('reload')" style="cursor:pointer">
        <div class="kpi-label">AT RELOAD (OTG)</div>
        <div class="kpi-value positive">${reloadStats.totalRemaining} units</div>
        <div class="kpi-sub">${reloadStats.otgTrucks} TLs</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">IN TRANSIT</div>
        <div class="kpi-value">${inTransitRail + inTransitTruck}</div>
        <div class="kpi-sub">🚂 ${inTransitRail} | 🚛 ${inTransitTruck}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">AVG DAYS OTG</div>
        <div class="kpi-value ${reloadStats.avgDaysOTG > 30 ? 'warn' : ''}">${reloadStats.avgDaysOTG}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">INTEREST</div>
        <div class="kpi-value ${reloadStats.totalInterest > 500 ? 'negative' : ''}">${fmt(reloadStats.totalInterest)}</div>
      </div>
      <div class="kpi" onclick="go('margin')" style="cursor:pointer">
        <div class="kpi-label">COMP BASIS MTD</div>
        <div class="kpi-value positive">${fmt(marginStats.compBasis)}</div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><span class="card-title">Commission Structure</span></div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
          <div style="background:var(--panel-alt);border-radius:4px;padding:12px">
            <div style="color:var(--muted);font-size:10px">TRANSIT</div>
            <div style="font-weight:600">60% Buy / 40% Sell</div>
          </div>
          <div style="background:var(--panel-alt);border-radius:4px;padding:12px">
            <div style="color:var(--muted);font-size:10px">FIRM</div>
            <div style="font-weight:600">40% Buy / 60% Sell</div>
          </div>
          <div style="background:var(--panel-alt);border-radius:4px;padding:12px">
            <div style="color:var(--muted);font-size:10px">SHORT</div>
            <div style="font-weight:600">40% Buy / 60% Sell</div>
          </div>
          <div style="background:var(--panel-alt);border-radius:4px;padding:12px">
            <div style="color:var(--muted);font-size:10px">Your Cut</div>
            <div style="font-weight:600;color:var(--positive)">35% → 40% → 45%</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid-3" style="margin-bottom:20px">
      <div class="card" onclick="go('reload')" style="cursor:pointer">
        <div class="card-body" style="text-align:center;padding:24px">
          <div style="font-size:32px;margin-bottom:8px">📦</div>
          <div style="font-weight:600">Reload Inventory</div>
          <div style="color:var(--muted);font-size:11px">${reloadStats.skuCount} SKUs</div>
        </div>
      </div>
      <div class="card" onclick="go('offers')" style="cursor:pointer">
        <div class="card-body" style="text-align:center;padding:24px">
          <div style="font-size:32px;margin-bottom:8px">📢</div>
          <div style="font-weight:600">Active Offers</div>
          <div style="color:var(--muted);font-size:11px">${activeOffers} live</div>
        </div>
      </div>
      <div class="card" onclick="go('blotter')" style="cursor:pointer">
        <div class="card-body" style="text-align:center;padding:24px">
          <div style="font-size:32px;margin-bottom:8px">📋</div>
          <div style="font-weight:600">Trade Blotter</div>
          <div style="color:var(--muted);font-size:11px">${marginStats.sellCount} sells</div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card-header"><span class="card-title">Recent Reload Activity</span></div>
      <div class="card-body" style="padding:0">
        <table class="tbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Product</th>
              <th>Mill</th>
              <th style="text-align:right">Units</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(S.reloadInventory || []).slice(0, 8).map(r => `
              <tr>
                <td>${fmtD(r.poDate || r.dateOTG)}</td>
                <td><span class="badge ${r.transportType === 'rail' ? 'negative' : 'info'}" style="font-size:10px">${r.transportType === 'rail' ? '🚂' : '🚛'}</span></td>
                <td>${r.product} ${r.length} ${r.grade}</td>
                <td style="color:var(--muted)">${r.mill || '—'}</td>
                <td style="text-align:right">${r.units}</td>
                <td><span class="badge ${r.status === 'unloaded' ? 'positive' : 'info'}" style="font-size:10px">${r.status === 'unloaded' ? '📦 OTG' : '🚛 Transit'}</span></td>
              </tr>
            `).join('')}
            ${(S.reloadInventory || []).length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--muted)">No reload activity. <a href="#" onclick="showReloadReceiptModal();return false">Add first receipt</a></td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==================== INTEGRATION ====================

function renderSPFView() {
  const c = document.getElementById('content');
  if (!c) return false;
  
  if (S.view === 'dashboard') {
    c.innerHTML = renderSPFDashboard();
    return true;
  } else if (S.view === 'reload') {
    c.innerHTML = renderReloadView();
    return true;
  } else if (S.view === 'transit') {
    c.innerHTML = renderTransitView();
    return true;
  } else if (S.view === 'offers') {
    c.innerHTML = renderOffersView();
    return true;
  } else if (S.view === 'margin') {
    c.innerHTML = renderMarginView();
    return true;
  } else if (S.view === 'freight') {
    c.innerHTML = renderFreightView();
    setTimeout(calcFreightPreview, 10);
    return true;
  }
  
  return false;
}
