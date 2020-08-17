from win32com.client import Dispatch, GetActiveObject, GetObject

# app = Dispatch("Photoshop.Application")


# doc = app.Documents.Add(320, 240)
# layerRef = doc.ArtLayers.Add()

# psTextLayer = 2  # from enum PsLayerKind
# layerRef.Kind = psTextLayer

# textItem = layerRef.TextItem
# textItem.Contents = "HELLO WORLD!"
# textItem.Position = (120, 120)

app = GetActiveObject("Photoshop.Application")

if len(app.Documents) < 1:
    docRef = app.Documents.Add()
else:
    docRef = app.ActiveDocument

if len(docRef.Layers) < 2:
    docRef.ArtLayers.Add()

activeLayerName = docRef.ActiveLayer.Name
SetLayerName = ''

if docRef.ActiveLayer.Name != app.ActiveDocument.Layers.Item(len(docRef.Layers)).Name:
    docRef.ActiveLayer = docRef.Layers.Item(len(docRef.Layers))
else:
    docRef.ActiveLayer = docRef.Layers.Item(1)

