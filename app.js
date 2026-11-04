const SIZES=[5,10,15,20,30], COLORS=['#dcecae','#c6e1d2','#cfdef0','#f7dda9','#f1c9c0','#e0d4ef'];
const KEY='studieplanlaegger-v1';
const $=s=>document.querySelector(s); let rows=Array.from({length:10},()=>[]), selectedSize=10, selectedColor=0, editing=null, drag=null;
try{const saved=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(saved)&&saved.length===10&&saved.every(r=>Array.isArray(r)&&r.reduce((n,b)=>n+Number(b.size),0)<=30&&r.every(b=>SIZES.includes(b.size)&&typeof b.name==='string'&&Number.isInteger(b.color)&&b.color>=0&&b.color<COLORS.length)))rows=saved}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(rows))}catch(e){toast('Planen kunne ikke gemmes i browseren.')}}
function toast(message){let t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3000)}
function sum(i){return rows[i].reduce((a,b)=>a+b.size,0)}
function render(){let list=$('#semesters');list.replaceChildren();let total=0;rows.forEach((blocks,i)=>{let used=sum(i);total+=used;let row=document.createElement('div');row.className='row';let label=document.createElement('div');label.className='sem-label';label.append(document.createTextNode((i+1)+'. semester'));let sub=document.createElement('span');sub.textContent=i<6?'Bachelor':'Kandidat';label.append(sub);let lane=document.createElement('div');lane.className='lane';lane.setAttribute('aria-label',(i+1)+'. semester, '+used+' af 30 ECTS');lane.addEventListener('dragover',e=>{e.preventDefault();lane.classList.add('dragover')});lane.addEventListener('dragleave',()=>lane.classList.remove('dragover'));lane.addEventListener('drop',e=>{e.preventDefault();lane.classList.remove('dragover');if(!drag)return;if(drag.kind==='new'){openEditor(null,i,drag.size)}else{let from=drag.row, index=drag.index;if(from!==i){let block=rows[from][index];if(sum(i)+block.size>30){toast('Der er ikke plads til blokken i dette semester.')}else{rows[from].splice(index,1);rows[i].push(block);save();render()}}}drag=null});blocks.forEach((b,j)=>{let el=document.createElement('button');el.type='button';el.className='block';el.draggable=true;el.style.background=COLORS[b.color];el.style.gridColumn='span '+(b.size/5);el.title=b.name+' · '+b.size+' ECTS. Klik for at redigere';let name=document.createElement('strong');name.textContent=b.name;let size=document.createElement('small');size.textContent=b.size+' ECTS';el.append(name,size);el.addEventListener('click',()=>openEditor({row:i,index:j},i,b.size));el.addEventListener('dragstart',()=>{drag={kind:'existing',row:i,index:j}});el.addEventListener('dragend',()=>{drag=null;document.querySelectorAll('.dragover').forEach(x=>x.classList.remove('dragover'))});lane.append(el)});let count=document.createElement('div');count.className='row-count'+(used===30?' full':'');count.textContent=used+' / 30';row.append(label,lane,count);list.append(row)});$('#total').textContent=total}
function renderSizes(){let container=$('#sizes');container.replaceChildren();SIZES.forEach(size=>{let b=document.createElement('button');b.type='button';b.className='size'+(selectedSize===size?' selected':'');b.draggable=true;b.innerHTML='<span>'+size+' ECTS</span><small>Træk eller vælg</small>';b.setAttribute('aria-pressed',selectedSize===size);b.addEventListener('click',()=>{selectedSize=size;renderSizes()});b.addEventListener('dragstart',()=>drag={kind:'new',size});b.addEventListener('dragend',()=>{drag=null;document.querySelectorAll('.dragover').forEach(x=>x.classList.remove('dragover'))});container.append(b)})}
function renderColors(){let c=$('#colors');c.replaceChildren();COLORS.forEach((color,i)=>{let b=document.createElement('button');b.type='button';b.className='swatch'+(selectedColor===i?' selected':'');b.style.background=color;b.setAttribute('aria-label','Farve '+(i+1));b.setAttribute('aria-pressed',selectedColor===i);b.addEventListener('click',()=>{selectedColor=i;renderColors()});c.append(b)})}
for(let i=0;i<10;i++){for(const id of ['#target','#semester']){let o=document.createElement('option');o.value=i;o.textContent=(i+1)+'. semester';$(id).append(o)}}
function openEditor(ref,row,size){editing=ref;let block=ref?rows[ref.row][ref.index]:null;$('#name').value=block?block.name:'';$('#credits').value=block?block.size:size;$('#semester').value=row;selectedColor=block?block.color:0;$('#delete').hidden=!block;$('#error').textContent='';renderColors();$('#editor').showModal();$('#name').focus()}
$('#add').addEventListener('click',()=>openEditor(null,Number($('#target').value),selectedSize));$('#close').addEventListener('click',()=>$('#editor').close());$('#edit-form').addEventListener('submit',e=>{e.preventDefault();let name=$('#name').value.trim(), size=Number($('#credits').value), dest=Number($('#semester').value);if(!name){$('#error').textContent='Skriv et navn til faget.';return}let existing=editing&&editing.row===dest?rows[editing.row][editing.index].size:0;if(sum(dest)-existing+size>30){$('#error').textContent='Der er ikke plads til '+size+' ECTS i dette semester.';return}let block={name,size,color:selectedColor};if(editing){if(editing.row===dest)rows[dest][editing.index]=block;else{rows[editing.row].splice(editing.index,1);rows[dest].push(block)}}else rows[dest].push(block);save();render();$('#editor').close()});$('#delete').addEventListener('click',()=>{if(editing){rows[editing.row].splice(editing.index,1);save();render();$('#editor').close()}});$('#clear').addEventListener('click',()=>{if(confirm('Vil du starte en ny plan? Alle blokke i den nuværende plan bliver slettet.')){rows=Array.from({length:10},()=>[]);save();render()}});

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function wordCell(text,width,fill,span){return '<w:tc><w:tcPr><w:tcW w:w="'+width+'" w:type="dxa"/>'+(span>1?'<w:gridSpan w:val="'+span+'"/>':'')+(fill?'<w:shd w:fill="'+fill+'"/>':'')+'<w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:sz w:val="19"/></w:rPr><w:t xml:space="preserve">'+esc(text)+'</w:t></w:r></w:p></w:tc>'}
function documentXml(){let grid='<w:gridCol w:w="1100"/>'+Array(6).fill('<w:gridCol w:w="1250"/>').join('');let body=rows.map((r,i)=>{let cells=wordCell((i+1)+'. semester',1100,'F1F4EB',1);for(const b of r)cells+=wordCell(b.name+' ('+b.size+' ECTS)',b.size/5*1250,COLORS[b.color].slice(1),b.size/5);let empty=6-sum(i)/5;if(empty)cells+=wordCell('',empty*1250,null,empty);return '<w:tr><w:trPr><w:cantSplit/><w:trHeight w:val="600" w:hRule="atLeast"/></w:trPr>'+cells+'</w:tr>'}).join('');return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>Studieplan</w:t></w:r></w:p><w:p><w:r><w:t>10 semestre · 30 ECTS pr. semester</w:t></w:r></w:p><w:tbl><w:tblPr><w:tblW w:w="8600" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="CBD4C8"/><w:left w:val="single" w:sz="4" w:color="CBD4C8"/><w:bottom w:val="single" w:sz="4" w:color="CBD4C8"/><w:right w:val="single" w:sz="4" w:color="CBD4C8"/><w:insideH w:val="single" w:sz="4" w:color="CBD4C8"/><w:insideV w:val="single" w:sz="4" w:color="CBD4C8"/></w:tblBorders><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>'+grid+'</w:tblGrid>'+body+'</w:tbl><w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="1100" w:bottom="900" w:left="1100"/></w:sectPr></w:body></w:document>'}
function crc32(bytes){let c=0xffffffff;for(let b of bytes){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^(-(c&1)&0xedb88320)}return (c^0xffffffff)>>>0}
function zip(files){let enc=new TextEncoder(),parts=[],central=[],offset=0;function header(n){return new Uint8Array(n)}function u16(a,i,v){a[i]=v&255;a[i+1]=(v>>>8)&255}function u32(a,i,v){u16(a,i,v);u16(a,i+2,v>>>16)}for(let [name,content] of Object.entries(files)){let n=enc.encode(name),data=enc.encode(content),crc=crc32(data),h=header(30);u32(h,0,0x04034b50);u16(h,4,20);u16(h,6,0x800);u32(h,14,crc);u32(h,18,data.length);u32(h,22,data.length);u16(h,26,n.length);parts.push(h,n,data);let d=header(46);u32(d,0,0x02014b50);u16(d,4,20);u16(d,6,20);u16(d,8,0x800);u32(d,16,crc);u32(d,20,data.length);u32(d,24,data.length);u16(d,28,n.length);u32(d,42,offset);central.push(d,n);offset+=h.length+n.length+data.length}let len=central.reduce((a,b)=>a+b.length,0),end=header(22);u32(end,0,0x06054b50);u16(end,8,Object.keys(files).length);u16(end,10,Object.keys(files).length);u32(end,12,len);u32(end,16,offset);return new Blob([...parts,...central,end],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})}
$('#export').addEventListener('click',()=>{let blob=zip({'[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>','_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>','word/document.xml':documentXml()});let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='studieplan.docx';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)});

// Read the Word table emitted by this planner, including earlier downloads.
async function readDocxXml(file){
  if(file.size>5*1024*1024)throw Error('Filen er for stor. Vælg en Word-fil under 5 MB.');
  const bytes=new Uint8Array(await file.arrayBuffer()), view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const u16=i=>view.getUint16(i,true),u32=i=>view.getUint32(i,true), decoder=new TextDecoder();
  let end=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(u32(i)===0x06054b50 && i+22+u16(i+20)===bytes.length){end=i;break}}
  if(end<0)throw Error('Filen er ikke en gyldig Word-fil.');
  let pos=u32(end+16), count=u16(end+10), entry=null;
  for(let i=0;i<count;i++){
    if(pos+46>bytes.length||u32(pos)!==0x02014b50)throw Error('Word-filen kunne ikke læses.');
    let nameLength=u16(pos+28),extraLength=u16(pos+30),commentLength=u16(pos+32),next=pos+46+nameLength+extraLength+commentLength;
    if(next>bytes.length)throw Error('Word-filen kunne ikke læses.');
    if(decoder.decode(bytes.subarray(pos+46,pos+46+nameLength))==='word/document.xml')entry={flags:u16(pos+8),method:u16(pos+10),size:u32(pos+20),uncompressed:u32(pos+24),offset:u32(pos+42)};
    pos=next;
  }
  if(!entry || entry.flags&1 || entry.uncompressed>5*1024*1024)throw Error('Studieplanen kunne ikke læses i Word-filen.');
  let p=entry.offset;if(p+30>bytes.length||u32(p)!==0x04034b50)throw Error('Word-filen kunne ikke læses.');
  let start=p+30+u16(p+26)+u16(p+28), finish=start+entry.size;
  if(finish>bytes.length)throw Error('Word-filen er ufuldstændig.');
  let content=bytes.slice(start,finish);
  if(entry.method===8){
    if(typeof DecompressionStream==='undefined')throw Error('Denne browser kan ikke læse denne Word-fil. Prøv en opdateret browser.');
    try{content=new Uint8Array(await new Response(new Blob([content]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())}catch(e){throw Error('Word-filen kunne ikke udpakkes i denne browser.')}
  }else if(entry.method!==0)throw Error('Word-filens komprimering understøttes ikke.');
  if(content.length!==entry.uncompressed)throw Error('Word-filen er ufuldstændig.');
  return decoder.decode(content);
}
function parsePlanXml(xml){
  const ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main', doc=new DOMParser().parseFromString(xml,'application/xml');
  if(doc.getElementsByTagName('parsererror').length)throw Error('Word-filens indhold kunne ikke læses.');
  const children=(element,name)=>Array.from(element.children).filter(e=>e.namespaceURI===ns&&e.localName===name);
  const tables=Array.from(doc.getElementsByTagNameNS(ns,'tbl'));
  const table=tables.find(t=>{let rr=children(t,'tr');return rr.length===10&&rr.every((r,i)=>{let cells=children(r,'tc');return cells.length>1&&Array.from(cells[0].getElementsByTagNameNS(ns,'t')).map(x=>x.textContent).join('').trim()===(i+1)+'. semester'})});
  if(!table)throw Error('Filen indeholder ikke en studieplan fra Studieplanlægger.');
  return children(table,'tr').map(row=>{
    const cells=children(row,'tc').slice(1), blocks=[];let spans=0;
    for(const cell of cells){
      let properties=children(cell,'tcPr')[0], spanElement=properties&&children(properties,'gridSpan')[0];
      let span=spanElement?Number(spanElement.getAttributeNS(ns,'val')):1;
      if(!Number.isInteger(span)||span<1||span>6)throw Error('En blok i filen har en ugyldig størrelse.');
      spans+=span;
      let value=Array.from(cell.getElementsByTagNameNS(ns,'t')).map(t=>t.textContent).join('').trim();
      if(!value)continue;
      let match=value.match(/^(.*) \((5|10|15|20|30) ECTS\)$/s);
      if(!match||!match[1].trim()||Number(match[2])!==span*5||match[1].length>120)throw Error('En blok i filen kunne ikke genkendes. Brug en fil downloadet fra Studieplanlægger.');
      let shade=properties&&children(properties,'shd')[0], fill=shade&&shade.getAttributeNS(ns,'fill');
      let color=COLORS.findIndex(c=>c.slice(1).toLowerCase()===(fill||'').toLowerCase());
      if(color<0)throw Error('En blok i filen har en farve, der ikke kan importeres.');
      blocks.push({name:match[1],size:Number(match[2]),color});
    }
    if(spans!==6)throw Error('Et semester i filen har en ugyldig størrelse.');
    return blocks;
  });
}
$('#import').addEventListener('click',()=>$('#import-file').click());
$('#import-file').addEventListener('change',async e=>{
  let file=e.target.files[0];e.target.value='';if(!file)return;
  try{
    let imported=parsePlanXml(await readDocxXml(file));
    if(rows.some(r=>r.length)&&!confirm('Importen erstatter din nuværende plan i denne browser. Vil du fortsætte?'))return;
    rows=imported;save();render();toast('Studieplanen er importeret.');
  }catch(error){alert(error.message||'Filen kunne ikke importeres. Vælg en Word-fil fra Studieplanlægger.')}
});

renderSizes();render();
