# we should probably be using some kind of framework but at least this way we have multiline strings

infotexts={
    "inputbox":r""" 
                        Die Trainingsdaten stammen aus dem MNIST Datensatz, bestehend aus 28x28 Pixel großen Bildern handgeschriebener Zahlen 
                        und ihren dazugehörigen Labels von 0 bis 9. 
                        Da die Bilder in Graustufen vorliegen, wird jeder Pixel durch einen Wert zwischen 0(weiß) und 1(schwarz) reprästentiert. <br>
                        <img class= "grayscale-image" src="../static/include/grayscale_number.png" alt = "schmematische Darstellung eines Bilds der Ziffer 1 als Grayscale matrix">
               
               """,
    "block1": r""" 
                        Besteht aus einer Filterschicht, einer Aktivierungsfunktion und einer MaxPool-Schicht. 
                         
                        <br> Die Größe der Ausgabe unterscheidet sich je nach Größe des Filters und seiner Schrittweite.
            """,
    "block2": r""" 
                        Besteht aus einer Filterschicht, einer Aktivierungsfunktion und einer MaxPool-Schicht. 
                         
                        <br> Die Größe der Ausgabe unterscheidet sich je nach Größe des Filters und seiner Schrittweite.
    """,
    "block3": r"""
                        Besteht aus einer Filterschicht, einer Aktivierungsfunktion und einer MaxPool-Schicht. 
                         
                        <br> Die Größe der Ausgabe unterscheidet sich je nach Größe des Filters und seiner Schrittweite.
    """,
    "block4": r"""
                        Besteht aus einer Filterschicht, einer Aktivierungsfunktion und einer MaxPool-Schicht. 
                         
                        <br> Die Größe der Ausgabe unterscheidet sich je nach Größe des Filters und seiner Schrittweite.
    """,
    "block5":r"""
                        Besteht aus einer Filterschicht, einer Aktivierungsfunktion und einer MaxPool-Schicht. 
                         
                        <br> Die Größe der Ausgabe unterscheidet sich je nach Größe des Filters und seiner Schrittweite.
    """,
    "outputbox":r"""
        Lineare Schichten kombinieren die erlernten Merkmale vorheriger Schichten. Aufeinandergestapelt erlauben sie es, zunehmend komplexe Zusammenhänge zu lernen.
        Zu viele Schichten führen jedoch dazu, dass das Modell Trainingsdaten auswendig lernt und mit neuen Daten nicht umgehen kann. 
    """,
    "actFuncCol":r"""
        Nicht alle Daten lassen sich linear separieren, daher nutzen neuronale Netzwerke nichtlineare Aktivierungsfunktionen, um auch solche Daten zu klassifizieren.
    """,
    "EpochsCol":r"""
        Wie oft das Modell den gesamten Trainingsdatensatz durchläuft.
    """,
    "LRateCol":r"""
        Wie stark die Gewichte des Modells bei jedem Update angepasst werden. Eine niedrigere Lernrate führt eher zu einer genaueren Optimierung, benötigt jedoch mehr Rechenaufwand und kann in lokalen Minima stecken bleiben.
    """,
    "BSizeCol":r"""
        Wieviele Daten betrachtet werden, bevor das Modell seine Gewichte anpasst. Dadurch sinkt der Rechenaufwand und der Einfluss von Ausreißern wird verringert.
    """,
    "KSizeCol":r"""
        Wie groß die Filter der einzelnen Layer sind. Generell gilt, spätere Filter sind kleiner als vorhergehende. Je nach größe des Filters werden auch automatisch Stride und Padding angepasst."""
}
