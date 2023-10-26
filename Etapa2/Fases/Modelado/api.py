import io
import joblib
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.templating import Jinja2Templates
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Load the pre-trained model
pipe = joblib.load('pipeline.joblib')

templates = Jinja2Templates(directory="templates")

# Configura CORS para permitir todas las solicitudes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Esto permite todas las solicitudes, pero puedes configurarlo de manera más restrictiva para producción
    allow_credentials=True,
    allow_methods=["*"],  # Puedes especificar los métodos permitidos (GET, POST, etc.)
    allow_headers=["*"],  # Puedes especificar los encabezados permitidos
)

@app.post("/predict/")
async def predict(file: UploadFile = File(None), text_input: str = Form(None)):
    try:
        if file:
            # Check if the uploaded file is an Excel file
            if not file.filename.endswith('.xlsx'):
                return JSONResponse(content={"error": "Please upload an Excel file"}, status_code=400)

            # Read the uploaded Excel file specifying the engine as 'openpyxl'
            data = pd.read_excel(io.BytesIO(file.file.read()), engine='openpyxl')

        elif text_input:
            # Create a DataFrame from the text input
            data = pd.DataFrame({'Textos_espanol': [text_input]})

        else:
            return JSONResponse(content={"error": "Please provide either a file or text input"}, status_code=400)

        # Make predictions using the loaded model
        predictions = pipe.predict(data)

        if file:
            # Convert predictions to a list
            predictions_list = predictions.tolist()
            return JSONResponse(content={"predictions": predictions_list}, status_code=200)
        else:
            # Create an Excel file with predictions
            output = pd.DataFrame({'Textos_espanol': data['Textos_espanol'], 'sdg': predictions})
            excel_output = io.BytesIO()
            output.to_excel(excel_output, index=False)
            return FileResponse(excel_output, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename='predictions.xlsx')

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
