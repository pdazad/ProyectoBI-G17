import io
import joblib
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
import pandas as pd

app = FastAPI()

# Load the pre-trained model
pipe = joblib.load('pipeline.joblib')

templates = Jinja2Templates(directory="templates")

@app.post("/predict/")
async def predict(file: UploadFile):
    try:
        # Check if the uploaded file is an Excel file
        if not file.filename.endswith('.xlsx'):
            return JSONResponse(content={"error": "Please upload an Excel file"}, status_code=400)

        # Read the uploaded Excel file
        data = pd.read_excel(io.BytesIO(file.file.read()))

        # Make predictions using the loaded model
        predictions = pipe.predict(data)

        # Convert predictions to a list
        predictions_list = predictions.tolist()

        return JSONResponse(content={"predictions": predictions_list}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
