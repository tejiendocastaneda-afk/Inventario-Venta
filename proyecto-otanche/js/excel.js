// ===== EXCEL.JS — IMPORTAR / EXPORTAR CSV =====

function downloadCSV(csvContent, filename){
  const BOM='\uFEFF';
  const blob=new Blob([BOM+csvContent],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
}

function exportarInventarioCSV(){
  const prods=DB.get('productos',[]);
  if(!prods.length){toast('Sin productos para exportar','warn');return;}
  const esc=v=>(v||'').toString().replace(/"/g,"'");
  let csv='SKU,Nombre,Categoria,Color,Talla,Modelo,Precio,PrecioOferta,Stock,Genero,Material,Marca,Suela\n';
  prods.forEach(p=>{
    csv+=`"${esc(p.sku)}","${esc(p.nombre)}","${esc(p.categoria)}","${esc(p.color)}","${esc(p.talla)}","${esc(p.modelo||p.modeloZapato)}","${p.precio||0}","${p.precioOferta||0}","${p.stock||0}","${esc(p.genero)}","${esc(p.material)}","${esc(p.marca)}","${esc(p.suela)}"\n`;
  });
  downloadCSV(csv,'inventario_otanche.csv');
  toast(`${prods.length} productos exportados`,'success');
}

function exportarApartadosCSV(){
  const aps=DB.get('apartados',[]);
  if(!aps.length){toast('Sin apartados para exportar','warn');return;}
  let csv='ID,Cliente,Telefono,Total,Pagado,Pendiente,Estado,Fecha,Vencimiento\n';
  aps.forEach(a=>{
    const pagado=a.abonos?a.abonos.reduce((s,ab)=>s+ab.monto,0):0;
    csv+=`"${a.id}","${a.cliente||''}","${a.telefono||''}","${a.total}","${pagado}","${a.total-pagado}","${a.estado}","${fmtDate(a.fecha)}","${fmtDate(a.fechaVencimiento)}"\n`;
  });
  downloadCSV(csv,'apartados_otanche.csv');
  toast('Apartados exportados','success');
}

function descargarPlantillaCSV(){
  const csv=`SKU,Nombre,Categoria,Color,Talla,Modelo,Precio,PrecioOferta,Stock,Genero,Material,Marca,Suela
Camp_0001-S,Camiseta Polo,ropa,Varios,S,Liso con Bolsillo,75000,0,3,hombre,Algodon,,
Camp_0001-M,Camiseta Polo,ropa,Varios,M,Liso con Bolsillo,75000,0,5,hombre,Algodon,,
Camp_0001-L,Camiseta Polo,ropa,Varios,L,Liso con Bolsillo,75000,0,2,hombre,Algodon,,
Camp_0001-XL,Camiseta Polo,ropa,Varios,XL,Liso con Bolsillo,75000,0,3,hombre,Algodon,,
Zap_0001-42,Tenis Running,zapatos,Blanco,42,Air Max,150000,120000,4,hombre,,,Nike,Caucho`;
  downloadCSV(csv,'plantilla_productos_otanche.csv');
  toast('Plantilla descargada','info');
}

// ===== IMPORTAR CSV =====
let csvParsedData=[];

function importarCSV(){
  csvParsedData=[];
  openModal('Importar Productos desde CSV',`
    <div style="background:var(--bg-tertiary);border-radius:var(--radius-sm);padding:1rem;margin-bottom:1rem;font-size:0.8rem;color:var(--text-secondary)">
      <strong style="color:var(--text-primary)">Columnas aceptadas:</strong><br>
      <span class="font-mono" style="font-size:0.72rem;line-height:2">
        SKU · Nombre · Categoria · Color · Talla · Modelo · Precio · PrecioOferta · Stock · Genero · Material · Marca · Suela
      </span><br>
      ✅ Primera fila (encabezado) se ignora.<br>
      ✅ <strong>Cada talla debe ser una fila separada</strong> — el SKU se hace único por talla automáticamente.<br>
      ✅ Categoría: <strong>ropa</strong> o <strong>zapatos</strong>. Si va vacío se asume ropa.<br>
      ✅ PrecioOferta: pon <strong>0</strong> si no hay oferta (no escribas "no").
    </div>
    <div style="margin-bottom:1rem">
      <button class="btn btn-secondary btn-sm" onclick="descargarPlantillaCSV()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Descargar plantilla de ejemplo
      </button>
    </div>
    <div class="form-group">
      <label>Seleccionar archivo CSV</label>
      <label style="display:flex;align-items:center;justify-content:center;gap:0.75rem;
        border:2px dashed var(--border);border-radius:var(--radius-sm);padding:1.5rem;
        cursor:pointer;background:var(--bg-tertiary);transition:border-color 0.2s"
        onmouseover="this.style.borderColor='var(--accent-green)'"
        onmouseout="this.style.borderColor='var(--border)'">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" stroke-width="2" width="32" height="32"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <div>
          <div style="font-weight:600;color:var(--text-primary)">Haz clic para elegir el archivo</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">.csv guardado desde Excel</div>
        </div>
        <input type="file" id="csvFileInput" accept=".csv,.txt,.tsv" style="display:none" onchange="previewCSV(this)">
      </label>
    </div>
    <div id="csvLoading" style="display:none;padding:0.75rem 0">
      <div style="height:6px;background:var(--bg-tertiary);border-radius:99px;overflow:hidden;margin-bottom:0.5rem">
        <div id="csvProgressBar" style="height:6px;background:var(--gradient);border-radius:99px;width:0%;transition:width 0.4s"></div>
      </div>
      <div id="csvLoadingMsg" style="font-size:0.8rem;color:var(--text-muted);text-align:center">Leyendo archivo...</div>
    </div>
    <div id="csvPreview" style="display:none;margin-top:0.75rem"></div>
    <div class="modal-footer" style="padding:1rem 0 0">
      <button class="btn btn-primary" id="btnImportarCSV" style="display:none" onclick="procesarImportCSV()">Importar productos</button>
      <button class="btn btn-secondary" onclick="closeModalDirect()">Cancelar</button>
    </div>`,{lg:true});
}

function previewCSV(input){
  const file=input.files[0];
  if(!file)return;
  const loading=document.getElementById('csvLoading');
  const bar=document.getElementById('csvProgressBar');
  const msg=document.getElementById('csvLoadingMsg');
  const preview=document.getElementById('csvPreview');
  const btn=document.getElementById('btnImportarCSV');
  if(loading)loading.style.display='block';
  if(preview)preview.style.display='none';
  if(btn)btn.style.display='none';
  if(bar)bar.style.width='20%';
  if(msg)msg.textContent='Leyendo archivo...';

  const reader=new FileReader();
  reader.onload=e=>{
    if(bar)bar.style.width='60%';
    if(msg)msg.textContent='Procesando filas...';
    setTimeout(()=>{
      try{
        const text=e.target.result;
        const sep=detectSeparator(text);
        csvParsedData=parseCSV(text,sep);
        if(bar)bar.style.width='100%';
        setTimeout(()=>{if(loading)loading.style.display='none';},400);

        if(!csvParsedData.length){
          if(preview){
            preview.style.display='block';
            preview.innerHTML=`<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius-sm);padding:1rem;color:var(--accent-red)">
              No se encontraron productos válidos.<br>
              <small>Verifica que la columna Nombre no esté vacía y que el archivo sea CSV.</small>
            </div>`;
          }
          return;
        }

        const nRopa=csvParsedData.filter(p=>p.categoria==='ropa').length;
        const nZapatos=csvParsedData.filter(p=>p.categoria==='zapatos').length;
        const sinPrecio=csvParsedData.filter(p=>!p.precio).length;
        const conOferta=csvParsedData.filter(p=>p.enOferta).length;
        const sample=csvParsedData.slice(0,10);

        if(preview){
          preview.style.display='block';
          preview.innerHTML=`
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin-bottom:0.75rem">
              <div style="background:var(--accent-green-dim);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-sm);padding:0.75rem;text-align:center">
                <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:1.6rem;color:var(--accent-green)">${csvParsedData.length}</div>
                <div style="font-size:0.7rem;color:var(--text-muted)">Total filas</div>
              </div>
              <div style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem;text-align:center">
                <div style="font-weight:800;font-size:1.6rem">👕 ${nRopa}</div>
                <div style="font-size:0.7rem;color:var(--text-muted)">Ropa</div>
              </div>
              <div style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem;text-align:center">
                <div style="font-weight:800;font-size:1.6rem">👟 ${nZapatos}</div>
                <div style="font-size:0.7rem;color:var(--text-muted)">Zapatos</div>
              </div>
              <div style="background:var(--bg-tertiary);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem;text-align:center">
                <div style="font-weight:800;font-size:1.6rem;color:var(--accent-amber)">⭐ ${conOferta}</div>
                <div style="font-size:0.7rem;color:var(--text-muted)">Oferta</div>
              </div>
            </div>
            ${sinPrecio?`<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-sm);padding:0.5rem 0.75rem;margin-bottom:0.5rem;font-size:0.78rem;color:var(--accent-amber)">
              ⚠️ ${sinPrecio} fila(s) sin precio — se importan con $0, puedes editarlos después.
            </div>`:''}
            <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.4rem">Primeros ${Math.min(10,csvParsedData.length)} de ${csvParsedData.length}:</p>
            <div class="table-wrap" style="font-size:0.78rem;max-height:220px;overflow-y:auto">
              <table>
                <thead><tr><th>#</th><th>SKU</th><th>Nombre</th><th>Talla</th><th>Color</th><th>Precio</th><th>Stock</th></tr></thead>
                <tbody>${sample.map((p,i)=>`<tr>
                  <td class="text-muted">${i+1}</td>
                  <td class="td-mono" style="font-size:0.7rem">${p.sku}</td>
                  <td class="td-bold">${p.nombre}</td>
                  <td>${p.talla||'—'}</td>
                  <td>${p.color||'—'}</td>
                  <td class="${p.precio?'text-green':'text-amber'}">${p.precio?fmt(p.precio):'$0 ⚠️'}</td>
                  <td>${p.stock||0}</td>
                </tr>`).join('')}</tbody>
              </table>
            </div>`;
        }
        if(btn){
          btn.style.display='inline-flex';
          btn.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>&nbsp;Importar ${csvParsedData.length} productos`;
        }
      }catch(err){
        if(loading)loading.style.display='none';
        if(preview){
          preview.style.display='block';
          preview.innerHTML=`<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius-sm);padding:1rem;color:var(--accent-red)">
            Error al leer: ${err.message}<br><small>Guarda el archivo como CSV UTF-8 desde Excel.</small>
          </div>`;
        }
      }
    },80);
  };
  reader.onerror=()=>{if(loading)loading.style.display='none';toast('Error al leer el archivo','error');};
  reader.readAsText(file,'UTF-8');
}

function detectSeparator(text){
  const first=(text.split(/\r?\n/)[0]||'');
  return(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
}

// ── Detectar en qué columna está cada campo ──
function detectColumns(headerLine, sep){
  const cols=headerLine.split(sep).map(c=>c.replace(/^["'\s\uFEFF]+|["'\s]+$/g,'').toLowerCase().trim());
  const find=(...keys)=>{
    for(const k of keys){
      const i=cols.findIndex(c=>c.includes(k));
      if(i>-1)return i;
    }
    return -1;
  };
  return{
    sku:     find('sku','código','codigo','ref'),
    nombre:  find('nombre','name','producto','descripci'),
    cat:     find('categor','tipo','category'),
    color:   find('color','colour'),
    talla:   find('talla','size','talle','talle'),
    modelo:  find('modelo','model','estilo','detalle'),
    precio:  find('precio *','precio','price','valor','pvp'),
    poferta: find('preciooferta','oferta','descuento','price_offer'),
    stock:   find('stock *','stock','cantidad','inventory','qty','existencia'),
    genero:  find('genero','género','gender','sexo'),
    material:find('material','fabric','tela'),
    marca:   find('marca','brand'),
    suela:   find('suela','sole'),
  };
}

function parseCSV(text,sep=','){
  const lines=text.split(/\r?\n|\r/).map(l=>l.trim()).filter(l=>l.length>0);
  if(lines.length<2)return[];

  // Limpiar BOM del encabezado
  const headerRaw=lines[0].replace(/^\uFEFF/,'');
  const colIdx=detectColumns(headerRaw,sep);

  // Contar SKUs usados en esta importación para hacer únicos los repetidos
  const skuCount={};

  const limpiarNum=v=>{
    if(!v||v.toString().toLowerCase()==='no'||v.toString().toLowerCase()==='sin')return 0;
    const s=v.toString().replace(/[$\s]/g,'').replace(/\./g,'').replace(',','.');
    const n=parseFloat(s);
    return isNaN(n)?0:Math.abs(n);
  };

  const getCol=(cols,idx,def='')=>idx>-1&&idx<cols.length?cols[idx].replace(/^["'\s]+|["'\s]+$/g,'').trim():def;

  const data=[];
  for(let i=1;i<lines.length;i++){
    const cols=splitCSVLine(lines[i],sep);
    if(cols.length<2)continue;

    const nombre=getCol(cols,colIdx.nombre);
    if(!nombre||nombre==='-'||nombre.toLowerCase()==='nombre'||nombre.toLowerCase()==='undefined')continue;

    const skuBase=getCol(cols,colIdx.sku)||`AUTO-${i}`;
    const talla=getCol(cols,colIdx.talla);
    const color=getCol(cols,colIdx.color);
    const precio=limpiarNum(getCol(cols,colIdx.precio));
    const precioOferta=limpiarNum(getCol(cols,colIdx.poferta));
    const stock=parseInt((getCol(cols,colIdx.stock,'0')).replace(/[^0-9]/g,''))||0;
    const catRaw=getCol(cols,colIdx.cat,'ropa').toLowerCase();

    // ── Hacer SKU único por talla/variante ──
    // Si el mismo SKU base aparece varias veces, añade sufijo -talla o -1,-2,-3...
    let skuFinal=skuBase;
    if(talla){
      skuFinal=`${skuBase}-${talla.replace(/\s/g,'')}`;
    }
    // Si aún así está repetido, añadir contador
    if(skuCount[skuFinal]!==undefined){
      skuCount[skuFinal]++;
      skuFinal=`${skuFinal}-${skuCount[skuFinal]}`;
    }else{
      skuCount[skuFinal]=0;
    }

    data.push({
      id:uid(),
      sku:skuFinal,
      nombre,
      categoria:catRaw.includes('zapato')||catRaw.includes('shoe')?'zapatos':'ropa',
      color,
      talla,
      modelo:getCol(cols,colIdx.modelo),
      precio,
      precioOferta,
      enOferta:precioOferta>0&&precioOferta<precio,
      stock,
      genero:getCol(cols,colIdx.genero),
      material:getCol(cols,colIdx.material),
      marca:getCol(cols,colIdx.marca),
      suela:getCol(cols,colIdx.suela),
      imagen:''
    });
  }
  return data;
}

function splitCSVLine(line,sep=','){
  const result=[];
  let cur='',inQ=false,i=0;
  while(i<line.length){
    const c=line[i];
    if(c==='"'){
      if(inQ&&line[i+1]==='"'){cur+='"';i+=2;continue;}
      inQ=!inQ;
    }else if(c===sep&&!inQ){result.push(cur);cur='';}
    else{cur+=c;}
    i++;
  }
  result.push(cur);
  return result;
}

function procesarImportCSV(){
  if(!csvParsedData.length){toast('Sin datos para importar','warn');return;}

  const existentes=DB.get('productos',[]);
  const duplicados=csvParsedData.filter(p=>
    existentes.findIndex(e=>e.sku&&e.sku.toUpperCase()===p.sku.toUpperCase())>-1
  );
  const nuevos=csvParsedData.length-duplicados.length;

  // Sin duplicados: importar directo sumando
  if(!duplicados.length){
    ejecutarImport('sumar');
    return;
  }

  // Con duplicados: mostrar resumen claro antes de confirmar
  closeModalDirect();

  // Construir filas de resumen de stock
  let filasStock='';
  duplicados.slice(0,15).forEach(p=>{
    const exist=existentes.find(e=>e.sku&&e.sku.toUpperCase()===p.sku.toUpperCase());
    const stockActual=exist?exist.stock:0;
    const stockSuma=stockActual+p.stock;
    filasStock+=`<div style="display:flex;justify-content:space-between;align-items:center;`
      +`padding:0.4rem 0.65rem;background:var(--bg-tertiary);border-radius:6px;font-size:0.78rem;margin-bottom:0.3rem">`
      +`<span style="font-weight:600">${p.nombre}${p.talla?' <span style="color:var(--text-muted)">('+p.talla+')</span>':''}</span>`
      +`<span style="font-family:monospace;color:var(--accent-green)">${stockActual} + ${p.stock} = <strong>${stockSuma}</strong></span>`
      +`</div>`;
  });
  if(duplicados.length>15){
    filasStock+=`<div style="font-size:0.72rem;color:var(--text-muted);text-align:center">...y ${duplicados.length-15} más</div>`;
  }

  openModal('Confirmar importación',
    `<div style="background:var(--accent-green-dim);border:1px solid rgba(16,185,129,0.3);`
    +`border-radius:var(--radius-sm);padding:1rem;margin-bottom:1rem;font-size:0.85rem">`
    +`<div style="font-weight:700;color:var(--accent-green);margin-bottom:0.4rem">Resumen de la importación</div>`
    +`<div style="color:var(--text-secondary)">`
    +`<div>🆕 <strong style="color:var(--text-primary)">${nuevos}</strong> productos nuevos — se agregan al inventario</div>`
    +`<div style="margin-top:0.25rem">➕ <strong style="color:var(--text-primary)">${duplicados.length}</strong> ya existen — se les <strong>sumará el stock</strong> y se actualizará el precio</div>`
    +`</div></div>`
    +`<div style="font-size:0.8rem;font-weight:600;color:var(--text-muted);margin-bottom:0.5rem">Stock que se va a sumar:</div>`
    +`<div style="max-height:180px;overflow-y:auto;margin-bottom:1rem">${filasStock}</div>`
    +`<div class="modal-footer" style="padding:1rem 0 0">`
    +`<button class="btn btn-primary" onclick="ejecutarImport('sumar')">➕ Confirmar — Sumar stock</button>`
    +`<button class="btn btn-secondary" onclick="closeModalDirect();csvParsedData=[];">Cancelar</button>`
    +`</div>`,
    {lg:true});
}

function ejecutarImport(modo){
  closeModalDirect();
  setTimeout(()=>{
    try{
      const existentes=DB.get('productos',[]);
      let cNuevos=0,cActualizados=0,cIgnorados=0;
      csvParsedData.forEach(p=>{
        const idx=existentes.findIndex(e=>e.sku&&e.sku.toUpperCase()===p.sku.toUpperCase());
        if(idx>-1){
          if(modo==='sumar'){
            existentes[idx]={...existentes[idx],...p,
              id:existentes[idx].id,
              imagen:existentes[idx].imagen||'',
              stock:(existentes[idx].stock||0)+(p.stock||0)};
            cActualizados++;
          } else if(modo==='reemplazar'){
            existentes[idx]={...existentes[idx],...p,id:existentes[idx].id,imagen:existentes[idx].imagen||''};
            cActualizados++;
          } else {
            cIgnorados++;
          }
        } else {
          existentes.push(p);
          cNuevos++;
        }
      });
      try{
        DB.set('productos',existentes);
      }catch(e){
        DB.set('productos',existentes.map(p=>({...p,imagen:''})));
        toast('Se quitaron imágenes para liberar espacio','warn');
      }
      csvParsedData=[];
      let msg='Importación completa: '+cNuevos+' nuevos';
      if(cActualizados) msg+=', '+cActualizados+' con stock sumado';
      if(cIgnorados)    msg+=', '+cIgnorados+' sin cambios';
      toast(msg,'success',6000);
      showModule('productos');
    }catch(err){
      toast('Error al guardar: '+err.message,'error');
    }
  },60);
}
