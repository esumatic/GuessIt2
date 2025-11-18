// Minimal, robust game.js for GuessIt (core logic trimmed & safe init)
let map, miniMap, streetView;
let locations = [];
const defaultLocations = [
  {lat:52.5208,lng:13.4094},{lat:50.1109,lng:8.6821},{lat:48.1351,lng:11.5820},
  {lat:53.5511,lng:9.9937},{lat:49.4875,lng:8.4660},{lat:51.2277,lng:6.7735},
  {lat:48.7758,lng:9.1829},{lat:49.0069,lng:8.4037},{lat:51.0493,lng:13.7384},
  {lat:50.9375,lng:6.9603},{lat:51.3397,lng:12.3731},{lat:52.3705,lng:9.7332},
  {lat:50.7333,lng:7.1004},{lat:48.8014,lng:9.0845},{lat:51.9616,lng:7.6261},
  {lat:49.4521,lng:11.0767},{lat:54.3233,lng:10.1228},{lat:50.1188,lng:8.6442},
  {lat:48.2060,lng:16.3695},{lat:47.3769,lng:8.5417},{lat:53.0793,lng:8.8017},
  {lat:51.5136,lng:7.4653},{lat:50.9375,lng:6.9603},{lat:51.1657,lng:10.4515},
  {lat:52.5208,lng:13.4094}
];
const HS_KEY = 'guessit_highscores';
const LOCS_KEY = 'guessit_locations';

// DOM refs (some may be undefined until DOM loaded)
const rankingList = document.getElementById('rankingList');
const btnTutorial = document.getElementById('btnTutorial');
const btnNewGame = document.getElementById('btnNewGame');
const btnAddLocation = document.getElementById('btnAddLocation');
const btnExportLocations = document.getElementById('btnExportLocations');
const streetviewEl = document.getElementById('streetview');
const miniMapEl = document.getElementById('miniMap');
const timerEl = document.getElementById('timer');
const guessBtn = document.getElementById('guessBtn');
const resultPanel = document.getElementById('resultPanel');

// safe-init guard for initGame
window.initGame = function(){
  if(window._gameStarted){
    console.log('initGame called again — ignored.');
    return;
  }
  window._gameStarted = true;
  console.log('initGame running — Google Maps API ready.');

  // load locations from storage or use defaults
  const saved = localStorage.getItem(LOCS_KEY);
  locations = saved ? JSON.parse(saved) : defaultLocations.slice();
  renderRanking();
  attachUI();

  // create StreetView and miniMap now that google.maps exists
  streetView = new google.maps.StreetViewPanorama(streetviewEl, {
    position: {lat:48.137154,lng:11.576124},
    pov:{heading:0,pitch:0},
    zoom:1,
    addressControl:false,
    linksControl:true,
    clickToGo:true
  });
  miniMap = new google.maps.Map(miniMapEl, {
    center:{lat:51.1657,lng:10.4515},
    zoom:5,
    disableDefaultUI:true,
    clickableIcons:false,
    gestureHandling:'greedy',
    styles:[{featureType:'poi',elementType:'labels',stylers:[{visibility:'off'}]}]
  });
};

function attachUI(){
  btnTutorial.onclick = ()=> startTutorial();
  btnNewGame.onclick = ()=> openNewGameModal();
  btnAddLocation.onclick = ()=> openAddLocation();
  btnExportLocations.onclick = ()=> exportLocations();
  guessBtn.onclick = ()=> confirmGuess();
  document.getElementById('messageOk').onclick = ()=> { hideMessage(); };
}

function renderRanking(){
  const highs = JSON.parse(localStorage.getItem(HS_KEY) || '[]');
  if(!rankingList) return;
  rankingList.innerHTML = '';
  highs.slice(0,25).forEach(h => {
    const li = document.createElement('li');
    const date = new Date(h.date).toLocaleString();
    li.innerHTML = `<strong>${escapeHtml(h.name)}</strong> — ${h.score} Punkte<br/><small>${date}</small>`;
    rankingList.appendChild(li);
  });
}

function startTutorial(){
  const tut = {lat:48.137154,lng:11.576124};
  if(streetView) streetView.setPosition(tut);
  showMessage('Tutorial: Firmenstandort wird angezeigt. Du kannst dich 5 Sekunden umsehen.');
  setTimeout(()=> hideMessage(), 5000);
}

// minimal new game modal flow (simple prompt to avoid modal layering complexity)
function openNewGameModal(){
  const name = prompt('Spielername (erforderlich):');
  if(!name) return alert('Spielername erforderlich.');
  const rounds = parseInt(prompt('Anzahl Runden (1-25):', '3')) || 3;
  startNewGame(name, Math.min(Math.max(rounds,1),25));
}

let roundCount=0, roundsTotal=3, usedIndexes=[], sessionResults=[], currentLocation=null, miniMarker=null;
let playerName='';

function startNewGame(name, rounds){
  roundCount=0; usedIndexes=[]; sessionResults=[];
  roundsTotal = rounds; playerName = name;
  startRound();
}

function startRound(){
  roundCount++;
  if(roundCount > roundsTotal){ finishGame(); return; }
  if(usedIndexes.length >= locations.length){ showMessage('Alle Standorte gespielt.'); finishGame(); return; }
  let idx; do { idx = Math.floor(Math.random()*locations.length); } while(usedIndexes.includes(idx));
  usedIndexes.push(idx);
  currentLocation = locations[idx];
  if(streetView) {
    streetView.setPosition(currentLocation);
    streetView.setPov({heading:0,pitch:0});
    streetView.setOptions({clickToGo:true,linksControl:true});
  }
  if(miniMap) {
    miniMap.setCenter({lat:51.1657,lng:10.4515});
    miniMap.setZoom(5);
    google.maps.event.clearListeners(miniMap,'click');
    miniMap.addListener('click', miniMapClickHandler);
  }
  clearMiniMarker();
  guessBtn.disabled = true;
  resultPanel.classList.add('hidden');
  startExplorationTimer(120, ()=>{
    if(streetView) streetView.setOptions({clickToGo:false,linksControl:false});
  });
}

let countdownInterval=null;
function startExplorationTimer(seconds, onEnd){
  clearInterval(countdownInterval);
  let rem=seconds;
  timerEl.textContent = formatTime(rem);
  countdownInterval = setInterval(()=>{
    rem--;
    timerEl.textContent = formatTime(rem);
    if(rem<=0){
      clearInterval(countdownInterval);
      if(onEnd) onEnd();
    }
  },1000);
}

function formatTime(s){
  const m=Math.floor(s/60);
  const sec=s%60;
  return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
}

function miniMapClickHandler(e){
  const latLng = e.latLng;
  if(miniMarker) miniMarker.setMap(null);
  miniMarker = new google.maps.Marker({position: latLng, map: miniMap, clickable:false});
  guessBtn.disabled = false;
}

function clearMiniMarker(){
  if(miniMarker){
    miniMarker.setMap(null);
    miniMarker=null;
  }
}

function confirmGuess(){
  if(!miniMarker || !currentLocation) return;
  const g = miniMarker.getPosition();
  const gu = {lat:g.lat(), lng:g.lng()};
  const distKm = haversineKm(gu.lat, gu.lng, currentLocation.lat, currentLocation.lng);
  let points = 0;
  if(distKm <= 0.05) points = 5000;
  else if(distKm >= 200) points = 0;
  else points = Math.round(5000*(1 - distKm/200));

  // Show markers on miniMap
  const trueMarker = new google.maps.Marker({
    position: currentLocation,
    map: miniMap,
    icon: {path: google.maps.SymbolPath.CIRCLE, scale:6, fillColor:'#f00', fillOpacity:1, strokeWeight:1},
    clickable:false
  });
  const guessMarker = new google.maps.Marker({
    position: gu,
    map: miniMap,
    icon: {path: google.maps.SymbolPath.CIRCLE, scale:6, fillColor:'#00f', fillOpacity:1, strokeWeight:1},
    clickable:false
  });

  const bounds = new google.maps.LatLngBounds();
  bounds.extend(guessMarker.getPosition());
  bounds.extend(trueMarker.getPosition());
  miniMap.fitBounds(bounds, 60);

  sessionResults.push({
    player: playerName,
    points,
    distanceKm: distKm,
    guess: gu,
    truePos: currentLocation,
    when: new Date().toISOString()
  });

  resultPanel.classList.remove('hidden');
  resultPanel.innerHTML = `<div style="padding:12px">
    <strong>Entfernung:</strong> ${distKm.toFixed(2)} km<br/>
    <strong>Punkte:</strong> ${points}
  </div>`;

  setTimeout(()=>{
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Nächste Runde';
    nextBtn.addEventListener('click', ()=>{
      clearMiniMarker();
      resultPanel.classList.add('hidden');
      startRound();
    });
    resultPanel.appendChild(nextBtn);
  }, 2000);

  guessBtn.disabled = true;
}

function finishGame(){
  const total = sessionResults.reduce((s,r)=> s + r.points, 0);
  const entry = {
    name: playerName,
    score: total,
    rounds: sessionResults,
    date: new Date().toISOString()
  };
  const hs = JSON.parse(localStorage.getItem(HS_KEY) || '[]');
  hs.push(entry);
  hs.sort((a,b)=> b.score - a.score);
  const trimmed = hs.slice(0,25);
  localStorage.setItem(HS_KEY, JSON.stringify(trimmed));
  sessionResults = [];
  usedIndexes = [];
  showMessage(`<strong>${escapeHtml(playerName)}</strong><br/>Gesamt: <strong>${total}</strong> Punkte<br/>Platz: ${trimmed.findIndex(h=> h.date===entry.date)+1}`, true);
  renderRanking();
}

function showMessage(html, showOk=false){
  window.showMessage(html, showOk);
}

function hideMessage(){
  window.hideMessage();
}

function openAddLocation(){
  alert('Ort hinzufügen: Tippe auf die Karte im sich öffnenden Dialog (TODO: Implementiert).');
}

function exportLocations(){
  const data = JSON.stringify(locations, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'guessit_locations.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{
    URL.revokeObjectURL(url);
    a.remove();
  },2000);
}

function haversineKm(lat1, lon1, lat2, lon2){
  const R=6371;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*
    Math.sin(dLon/2)*Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(d){ return d * Math.PI/180; }
function escapeHtml(s){
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}
