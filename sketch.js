let myTable; //variabile vuota per mettere dentro il csv
let maxVisitatori = 0;
let margin = 20;
let gutter = 4;
let spazioSopra = 80;
let coloreSfondo = '#110106';
let hoveredId = null; //variabile per l'hover > se mouse non è sulla colonna è null
let lineaScala = 1000000; //linea ogni milione
let spazioEtichette = 25;

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
  "Netherlands":    "#ff9d5c",
  "Australia":      "#4e5cd8",
  "Vatican City":   "#787878",
  "Taiwan":         "#ee196e",
  "Singapore":      "#bbb3da",
  "Italy":          "#C44536",
  "Greece":         "#023E8A"
};

async function setup() {
  createCanvas(windowWidth, windowHeight);

  myTable = await loadTable("assets/museums.csv", ",", "header");

  for (let numRiga = 0; numRiga < myTable.getRowCount(); numRiga++) {
    let visitatori = myTable.getNum(numRiga, "visitors_2025");
    if (visitatori > maxVisitatori) {
      maxVisitatori = visitatori;
    }
  }
}

function draw() {
  background(coloreSfondo);
  textFont('JetBrainsMono-Variable, monospace'); //messo un altro carattere nel caso in cui quello che ho scelto non si dovesse caricare

  let numeroGutter = myTable.getRowCount() - 1;
  let larghezza = (width - 2 * margin - spazioEtichette - numeroGutter * gutter) / myTable.getRowCount(); //larghezza colonna

  //scala di valori (ogni milione)
  let posx = margin + spazioEtichette; //posizione della prima colonna (lasciare spazio per le etichette)

  let label = "";
  hoveredId = null; // reset a ogni frame

  let yBase = height - margin;
  let altezzaMax = height - 2 * margin - spazioSopra;

  textSize(12);
  textAlign(RIGHT, CENTER);
  strokeWeight(2);

  for (let v = lineaScala; v <= maxVisitatori; v += lineaScala) { //ciclo che fa andare avanti la scala di linee finchè non supera il valore massimo
    let y = yBase - map(v, 0, maxVisitatori, 0, altezzaMax); //altezza della linea

    // linea
    stroke(255, 50);
    line(margin + spazioEtichette, y, width - margin, y);

    // etichetta
    noStroke();
    fill(238, 229, 233);
    text(v / 1000000 + "M", margin + spazioEtichette - 8, y);
  }
  noStroke();

  //ciclo per disegnare le colonne
  for (let numRiga = 0; numRiga < myTable.getRowCount(); numRiga++) {
    let visitatori = myTable.getNum(numRiga, "visitors_2025");
    let paese = myTable.getString(numRiga, "country");
    let nome = myTable.getString(numRiga, "museum");

    //altezza massima > lascia spazio sopra per titolo e legenda
    let altezza = map(visitatori, 0, maxVisitatori, 0, height - 2 * margin - spazioSopra);
    let yTop = yBase - altezza;
    let xCentro = posx + larghezza / 2;

    //disegno glifi colonna
    disegnoColonna(xCentro, yBase, yTop, larghezza, colori[paese]);

    //rollover
    if (mouseX >= posx && mouseX <= posx + larghezza &&
        mouseY >= yTop && mouseY <= yBase) {
      label = nome + " (" + paese + ")";
      hoveredId = nome;
    }

    posx += larghezza + gutter;
  }

  cursor(hoveredId !== null ? HAND : ARROW); //cursore divant amno all'hover

  textAlign(LEFT, CENTER);

  //titolo
  fill(238, 229, 233);
  textSize(40);
  text("Most visited art museums in 2025", margin, margin + 15);

  //legenda
  textSize(18);
  let legX = width - 180;
  let legY = margin + 10;
  let i = 0;
  for (let paese in colori) {
    fill(colori[paese]);
    circle(legX, legY + i * 20, 10);
    fill(238, 229, 233);
    text(paese, legX + 12, legY + i * 20);
    i++;
  }

  //testo rollover
  if (label != "") {
    let larghezzaTesto = textWidth(label);
    let padding = 6;
    let x = mouseX + 8;
    let y = mouseY + 16;
    
    //evitare che il testo esca dallo schermo
    if (x + larghezzaTesto + padding > width - margin) {
      x = mouseX - 8 - larghezzaTesto;
    }

    //sfondo grigio del testo
    fill(80, 200);
    
    let hTesto = textSize();
    rect(x - padding, y - hTesto / 2 - padding, larghezzaTesto + 2 * padding, hTesto + 2 * padding);

    //testo
    fill(238, 229, 233);
    text(label, x, y);
  }
}

function disegnoColonna(xCentro, yBase, yTop, larghezza, colore) {
  
  //capitello
  let hSopra = 4; 
  let hMezzo = 6; 
  let hCapitello = hSopra + hMezzo;
  let yFusto = yTop + hCapitello; 

  //base
  let hTerra = 4; 
  let hEllisse = 4; 
  let hBase = hTerra + hEllisse;
  let yFustoBasso = yBase - hBase; 

  let wBase = larghezza * 0.8; 
  let wCima = larghezza * 0.65; 
  
  noStroke();
  fill(colore);

  //terra
  rect(xCentro - larghezza / 2, yBase - hTerra, larghezza, hTerra);

  //ellisse (con angoli arrotondati)
  rect(xCentro - larghezza * 0.45, yBase - hBase, larghezza * 0.9, hEllisse, 2);

  //fusto
  quad(xCentro - wBase / 2, yFustoBasso,
       xCentro + wBase / 2, yFustoBasso,
       xCentro + wCima / 2, yFusto,
       xCentro - wCima / 2, yFusto);

  //scanalature > 3 linee scure lungo il fusto
  stroke(coloreSfondo);
  strokeWeight(1);
  for (let k = -1; k <= 1; k++) {
    line(xCentro + k * wBase / 4, yFustoBasso,
         xCentro + k * wCima / 4, yFusto);
  }
  noStroke();

  //mezzo
  quad(xCentro - wCima / 2, yFusto,
       xCentro + wCima / 2, yFusto,
       xCentro + larghezza * 0.45, yTop + hSopra,
       xCentro - larghezza * 0.45, yTop + hSopra);

  //sopra
  rect(xCentro - larghezza / 2, yTop, larghezza, hSopra);
}

function mousePressed() {
  if (hoveredId === null) return; //se quando clicco non sono sulla colonna è nullo e non succede nulla

  let newURL = "detail.html?museum=" + encodeURIComponent(hoveredId); //encodeURIComponent converte spazi e caratteri speciali in un formato leggibile per gli URL
  window.location.href = newURL;
}