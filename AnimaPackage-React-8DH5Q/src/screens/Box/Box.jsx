import React from "react";
import "./style.css";

export const Box = () => {
  return (
    <div className="box">
      <div className="flattenforframe">
        <img
          className="DALLE"
          alt="Dalle"
          src="/img/dall-e-2023-12-20-14-48-45-a-detailed-data-visualization-graph.png"
        />
        <p className="text-wrapper">Was ist Machine Learning (ML)?</p>
        <div className="overlap">
          <p className="wenn-kreis-in-bild">
            wenn Kreis in Bild:
            <br />
            <br />
            0, 8, 9<br />
            <br />
            wenn zwei Kreise im Bild: <br />8<br />
            <br />
            wenn gerader Strich: <br />1<br />
            <br />
            ...
          </p>
        </div>
        <div className="overlap-group">
          <div className="div">
            <div className="rectangle" />
            <div className="element">
              [5,04,1,9,2,1,3,1,4,
              <br />
              3,5,4,6,1,7,2,8,6,9]
            </div>
            <img className="arrow" alt="Arrow" src="/img/arrow-5.svg" />
          </div>
          <div className="text-wrapper-2">Ergebnis</div>
        </div>
        <div className="overlap-2">
          <img className="mnist-images" alt="Mnist images" src="/img/mnist-images-2.png" />
          <div className="text-wrapper-3">Daten</div>
        </div>
        <img className="img" alt="Mnist images" src="/img/mnist-images-2.png" />
        <div className="text-wrapper-4">Ausgabe</div>
        <div className="text-wrapper-5">Daten</div>
        <div className="element-2">
          [5,04,1,9,2,1,3,1,4,
          <br />
          3,5,4,6,1,7,2,8,6,9]
        </div>
        <p className="p">
          Teilgebiet von künstlicher Intelligenz, in dem Algorithmen automatisch aus Daten lernen, um Probleme zu lösen.
        </p>
        <div className="text-wrapper-6">Beispiel: Handschrifterkennung</div>
        <p className="text-wrapper-7">Explizites Programmieren vs. Machine Learning</p>
        <div className="text-wrapper-8">Programmierende erstellen Regeln</div>
        <img className="arrow-2" alt="Arrow" src="/img/arrow-1.svg" />
        <img className="arrow-3" alt="Arrow" src="/img/arrow-2.svg" />
        <p className="explizites">
          Explizites Programmieren
          <br />
          <br />
          Problem identifizieren
          <br />
          Daten betrachten
          <br />
          Regeln zur Problemlösung aufstellen
          <br />
          Mit gewünschtem Ergebnis vergleichen
        </p>
        <p className="machine-learning">
          Machine Learning
          <br />
          <br />
          Problem identifizieren
          <br />
          Daten und gewünschtes Ergebnis an Algorithmus geben
          <br />
          Algorithmus erstellt selbstständig Regeln
        </p>
        <img className="arrow-4" alt="Arrow" src="/img/arrow-3.svg" />
        <img className="arrow-5" alt="Arrow" src="/img/arrow-4.svg" />
        <div className="text-wrapper-9">Algorithmus “erlernt” Regeln</div>
        <img className="arrow-6" alt="Arrow" src="/img/arrow-6.svg" />
      </div>
    </div>
  );
};
