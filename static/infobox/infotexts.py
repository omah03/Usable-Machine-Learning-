# we should probably be using some kind of framework but at least this way we have multiline strings

infotexts={
    "inputbox":r""" 
                        Die Trainingsdaten stammen aus dem MNIST Datensatz, bestehend aus 28x28 Pixel großen Bildern handgeschriebener Zahlen 
                        und ihren dazugehörigen Labels von 0 bis 9. 
                        Da die Bilder in Graustufen vorliegen, wird jeder Pixel durch einen Wert zwischen 0(weiß) und 1(schwarz) reprästentiert. <br>
                        <img class= "grayscale-image" src="../static/include/grayscale_number.png" alt = "schmematische Darstellung eines Bilds der Ziffer 1 als Grayscale matrix">
               
               """,
    "ConvInfo": r"""
                        Die Filterschicht ist der Kern des CNNs. Mehr Infos dazu solltest du oben schon gesehen haben.
            """,
    "ActFuncInfo": r"""
                        Die Aktivierungsfunktion ist eine Funktion, die auf jeden Ausgabewert der verhergehenden Schicht angewendet wird.
                        Eine nichtlineare Aktivierungsfunktion wie ReLU ermöglicht es dem CNN, komplexere und nichtlineare Funktionen zu erlernen,
                        was dazu führt, dass das Netzwerk besser in der Lage ist, Muster und Merkmale in den Daten zu extrahieren und abzubilden. 
        """,
    "MaxPoolInfo": r"""
                        Das Max-Pooling Layer funktioniert im Kern wie ein Filter, nur dass immer einfach der größte der betrachteten Werte als Wert der Merkmalskarte genommen wird.
                        So sollen erkannte Merkmale verschärft und komprimiert werden.
            """,
    "outputbox":r"""
        Lineare Schichten kombinieren die erlernten Merkmale vorheriger Schichten. Aufeinandergestapelt erlauben sie es, zunehmend komplexe Zusammenhänge zu lernen.
        Zu viele Schichten führen jedoch dazu, dass das Modell Trainingsdaten auswendig lernt und mit neuen Daten nicht umgehen kann. 
    """,
    "actFunc":r"""
        Nicht alle Daten lassen sich linear separieren, daher nutzen neuronale Netzwerke nichtlineare Aktivierungsfunktionen, um auch solche Daten zu klassifizieren.
    """,
    "NEpochsSlider":r"""
        Wie oft das Modell den gesamten Trainingsdatensatz durchläuft.
    """,
    "LRateSlider":r"""
        Wie stark die Gewichte des Modells bei jedem Update angepasst werden. Eine niedrigere Lernrate führt eher zu einer genaueren Optimierung, benötigt jedoch mehr Rechenaufwand und kann in lokalen Minima stecken bleiben.
    """,
    "BSizeSlider":r"""
        Wieviele Daten betrachtet werden, bevor das Modell seine Gewichte anpasst. Dadurch sinkt der Rechenaufwand und der Einfluss von Ausreißern wird verringert.
    """,
    "KSizeSlider":r"""
        Wie groß die Filter der einzelnen Layer sind. Generell gilt, spätere Filter sind kleiner als vorhergehende. Je nach größe des Filters werden auch automatisch Stride und Padding angepasst."""
}
