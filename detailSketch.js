let backgroundColor = '#110106';

let colori = {
  "United Kingdom": "#9B287B",
  "Japan":          "#d3d7cf",
  "France":         "#5FA8D3",
  "United States":  "#1D9A6C",
  "Poland":         "#C77DFF",
  "South Korea":    "#FF85A1",
  "Russia":         "#f9d0a2",
  "Mexico":         "#a2b94e",
  "China":          "#D00000",
  "Spain":          "#aa9066",
  "Netherlands":    "#FA8334",
  "Australia":      "#4e5cd8",
  "Vatican City":   "#787878",
  "Taiwan":         "#ee196e",
  "Singapore":      "#bbb3da",
  "Italy":          "#C44536",
  "Greece":         "#023E8A"
};

let selectedMuseumId; //nome del museo letto dall'URL
let museumRow; //riga del CSV di quel museo
let visitors = 0;
let numColonne = 0;
let margin = 20;
let xInizio = margin;

let hFreccia = 35;
let wColonna = 20; //larghezza
let hColonna = 40; //altezza
let gapX = 6; //spazio orizzontale tra colonne
let gapY = 8; //spazio verticale tra righe
let altezzaTesto = 120; //spazio tra testo e colonne
let visitatoriPerColonna = 5000; //quanti visitatori vale una colonna

async function setup() {
  let data = await loadTable("assets/museums.csv", ",", "header");

  let params = new URLSearchParams(window.location.search); //legge i parametri dell'indirizzo della pagina
  selectedMuseumId = params.get("museum"); //estrae il valore di museum

  let altezzaCanvas = windowHeight; //il canvas è alto quanto l'altezza del window così si può scorrere in basso
  museumRow = data.findRow(selectedMuseumId, "museum");

  if (museumRow) {
    visitors = museumRow.getNum("visitors_2025");
    numColonne = ceil(visitors / visitatoriPerColonna); //arrotonda per eccesso

    let righe = ceil(numColonne / colonnePerRiga(windowWidth));
    let altezzaCanvasMax = margin + altezzaTesto + righe * (hColonna + gapY) + margin;
    altezzaCanvas = max(windowHeight, altezzaCanvasMax);
  }

  createCanvas(windowWidth, altezzaCanvas);
  noLoop();
}

function mouseMoved() {
  cursor(mouseOverFreccia() ? HAND : ARROW);
}

// quante colonne entrano in una riga
function colonnePerRiga(larghezzaPagina) {
  return max(1, floor((larghezzaPagina - 2 * margin + gapX) / (wColonna + gapX))); //tolti i margini a sinistra e a destra; max(1,) > per avere almeno una colonna sempre anche se si restringe al massimo lo schermo
}

function draw() {
  if (!museumRow) return; //museo non trovato > non disegna nulla

  background(backgroundColor);
  textFont('JetBrainsMono-Variable, monospace');
  let perRiga = colonnePerRiga(width);
  let larghezzaGriglia = perRiga * wColonna + (perRiga - 1) * gapX; //larghezza di una riga piena
  xInizio = (width - larghezzaGriglia) / 2; //margine uguale a sinistra e a destra

  let paese = museumRow.getString("country");
  let colore = colori[paese];

   // testi
  noStroke();
  fill(238, 229, 233);
  textAlign(LEFT, TOP);
  textSize(35);
  text(selectedMuseumId + " (" + paese + ")", xInizio + 50, margin);

  // freccia indietro
  stroke(238, 229, 233);
  strokeWeight(3);
  strokeCap(ROUND);
  let cy = margin + hFreccia / 2; //centro verticale della freccia
  line(xInizio + 4, cy, xInizio + 30, cy); //asta
  line(xInizio + 4, cy, xInizio + 16, cy - 10); //linea alta
  line(xInizio + 4, cy, xInizio + 16, cy + 10); //linea bassa
  noStroke();

  textSize(25);
  text(visitors.toLocaleString('it-IT') + " visitors in 2025", xInizio, margin + 45);
    
  // legenda
  let hLegenda = 30;
  let wLegenda = hLegenda / 2; //largh colonna della legenda è h/2
  let scalaLegenda = hLegenda / hColonna;//quanto è più piccola rispetto a una colonna normale
  let yLegenda = margin + 72;// pos y di partenza

  disegnoColonna(xInizio + wLegenda / 2, yLegenda + hLegenda, yLegenda, wLegenda, '#EEE5E9', scalaLegenda);
  //testo legenda
  fill(238, 229, 233);
  textSize(18);
  textAlign(LEFT, CENTER);
  text("= " + visitatoriPerColonna.toLocaleString('it-IT') + " visitors (rounded up)",
  xInizio + wLegenda + 8, yLegenda + hLegenda / 2);
    
  //disegna colonne  
  for (let i = 0; i < numColonne; i++) { 
    let col = i % perRiga;
    let riga = floor(i / perRiga);

    let x = xInizio + col * (wColonna + gapX);
    let yTop = margin + altezzaTesto + riga * (hColonna + gapY);

    disegnoColonna(x + wColonna / 2, yTop + hColonna, yTop, wColonna, colore);
  }
  
}

function disegnoColonna(xCentro, yBase, yTop, larghezza, colore, scala = 1) {
  // capitello
  let hSopra = 4 * scala;
  let hMezzo = 6 * scala;
  let hCapitello = hSopra + hMezzo;
  let yFusto = yTop + hCapitello;

  // base
  let hTerra = 4 * scala;
  let hEllisse = 4 * scala;
  let hBase = hTerra + hEllisse;
  let yFustoBasso = yBase - hBase;

  let wBase = larghezza * 0.8;
  let wCima = larghezza * 0.65;

  noStroke();
  fill(colore);

  // terra
  rect(xCentro - larghezza / 2, yBase - hTerra, larghezza, hTerra);

  // base arrotondata
  rect(xCentro - larghezza * 0.45, yBase - hBase, larghezza * 0.9, hEllisse, 2 * scala);

  // fusto
  quad(xCentro - wBase / 2, yFustoBasso,
       xCentro + wBase / 2, yFustoBasso,
       xCentro + wCima / 2, yFusto,
       xCentro - wCima / 2, yFusto);

  // scanalature
  stroke(backgroundColor);
  strokeWeight(1);
  for (let k = -1; k <= 1; k++) {
    line(xCentro + k * wBase / 4, yFustoBasso,
         xCentro + k * wCima / 4, yFusto);
  }
  noStroke();

  // parte di mezzo del capitello
  quad(xCentro - wCima / 2, yFusto,
       xCentro + wCima / 2, yFusto,
       xCentro + larghezza * 0.45, yTop + hSopra,
       xCentro - larghezza * 0.45, yTop + hSopra);

  // sommità
  rect(xCentro - larghezza / 2, yTop, larghezza, hSopra);
}

//vero se il mouse è sopra l'area della freccia
function mouseOverFreccia() {
  return mouseX >= xInizio && mouseX <= xInizio + 40 &&
       mouseY >= margin && mouseY <= margin + hFreccia;
}

function mousePressed() {
  if (mouseOverFreccia()) {
    window.location.href = "index.html";
  }
}
