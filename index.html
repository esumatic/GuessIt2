<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover" />
  <title>GuessIt — Minimal</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <aside id="sidebar">
      <h2>GuessIt</h2>
      <div id="rankingContainer">
        <h3>Ranking</h3>
        <ol id="rankingList"></ol>
      </div>
      <div id="controlsList">
        <button id="btnTutorial">Tutorial</button>
        <button id="btnNewGame">Neues Spiel</button>
        <button id="btnAddLocation">Ort hinzufügen</button>
        <button id="btnExportLocations">Orte exportieren</button>
      </div>
      <footer>Local Highscores • max 25</footer>
    </aside>

    <main id="main">
      <header id="topbar">
        <div id="title">GuessIt</div>
        <div id="sessionInfo"></div>
      </header>

      <section id="playArea">
        <div id="streetview" class="panel"></div>

        <div id="miniMapContainer" class="panel small">
          <div id="miniMap"></div>
          <div id="miniHint">Tippe zum Setzen des Markers. Tippe erneut, um ihn zu verschieben.</div>
        </div>

        <div id="hud">
          <div id="timer">02:00</div>
          <button id="guessBtn" disabled>GuessIt</button>
        </div>

        <div id="resultPanel" class="panel hidden"></div>
      </section>
    </main>
  </div>

  <!-- Overlay and minimal API-key modal -->
  <div id="modalOverlay" class="hidden"></div>

  <div id="apiModal" class="modal">
    <div class="modalContent">
      <h2>Google Maps API-Key</h2>
      <p>Kurz: Der Key wird <strong>nicht</strong> gespeichert. Bitte eingeben:</p>
      <input id="apiKeyInput" placeholder="API Key" autocomplete="off" />
      <div class="modalActions">
        <button id="apiLoadBtn">Weiter</button>
      </div>
      <div id="apiStatus" style="margin-top:8px;font-size:13px;color:#666"></div>
    </div>
  </div>

  <!-- Message modal -->
  <div id="messageModal" class="modal hidden">
    <div class="modalContent">
      <div id="messageText"></div>
      <div class="modalActions">
        <button id="messageOk">OK</button>
      </div>
    </div>
  </div>

  <script src="game.js"></script>

  <script>
  // Minimal, robust Maps loader. Loads API only after user enters key.
  (function(){
    const apiModal = document.getElementById('apiModal');
    const apiOverlay = document.getElementById('modalOverlay');
    const apiInput = document.getElementById('apiKeyInput');
    const apiBtn = document.getElementById('apiLoadBtn');
    const statusEl = document.getElementById('apiStatus');

    function showApiModal(){ apiOverlay.classList.remove('hidden'); apiModal.classList.remove('hidden'); apiInput.focus(); }
    function hideApiModal(){ apiOverlay.classList.add('hidden'); apiModal.classList.add('hidden'); statusEl.textContent = ''; }

    // ensure no other script tag for maps exists
    function mapsScriptExists(){
      return Array.from(document.getElementsByTagName('script')).some(s=> s.src && s.src.indexOf('maps.googleapis.com')!==-1);
    }

    // once page loads, show minimal modal
    document.addEventListener('DOMContentLoaded', ()=>{
      // safety: if maps already present (shouldn't), don't show modal
      if(window.google && google.maps){
        // maps already loaded — just init
        if(window.initGame) window.initGame();
        return;
      }
      showApiModal();
    });

    // guard against double clicks
    let loading = false;
    apiBtn.addEventListener('click', ()=>{
      if(loading) return;
      const key = apiInput.value.trim();
      if(!key){ statusEl.textContent = 'Bitte Key eingeben.'; return; }
      // do not store key anywhere
      loading = true;
      statusEl.textContent = 'Lade Google Maps...';

      // Avoid injecting script twice
      if(mapsScriptExists()){
        statusEl.textContent = 'Maps-Script bereits vorhanden — versuche init.';
        loading = false;
        if(window.initGame) window.initGame();
        hideApiModal();
        return;
      }

      // create script with callback to _onMapsReady
      window._mapsLoading = true;
      window._mapsKey = null; // explicitly not stored beyond runtime
      const s = document.createElement('script');
      s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key) + '&v=weekly&callback=_onMapsReady';
      s.async = true;
      s.defer = true;
      s.onerror = function(){
        loading = false;
        statusEl.textContent = 'Fehler beim Laden. Prüfe Key/Referrer. ';
      };
      document.head.appendChild(s);
    });

    // Called by Google Maps when fully ready (global callback)
    window._onMapsReady = function(){
      window._mapsLoaded = true;
      // hide modal and call init once
      hideApiModal();
      if(window.initGame) window.initGame();
    };

    // Message modal ok
    document.getElementById('messageOk').addEventListener('click', ()=>{
      document.getElementById('messageModal').classList.add('hidden');
      document.getElementById('modalOverlay').classList.add('hidden');
    });
  })();
  </script>
</body>
</html>

