import React, { useState, useRef } from 'react';
import './TextClassifier.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';

function TextClassifier() {
  const [inputText, setInputText] = useState('');
  const [classification, setClassification] = useState('');
  const [description, setDescription] = useState('');
  const [showResult, setShowResult] = useState(false);
  const fileInputRef = useRef(null);

  const handleTextToExcel = () => {
    // Convert the input text to an Excel file
    const excelFile = textToExcel(inputText);

    // Send the Excel file to the API
    sendToApi(excelFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Send the selected file to the API
      sendToApi(selectedFile);
    }
  };

  const sendToApi = async (file) => {
    try {
      const formdata = new FormData();
      formdata.append('file', file);

      const requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow',
      };

      // Replace 'http://localhost:8000/predict' with the correct API URL
      const response = await fetch('http://localhost:8000/predict', requestOptions);

      if (response.ok) {
        const data = await response.json();
        handleResponse(data);
        
      } else {
        // Handle errors here
        console.error('Error:', response);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleResponse = async (data) => {
    if (data.error) {
      console.error('Error:', data.error);
    } else if (data.predictions && data.predictions.length > 1) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Predictions');
      
      worksheet.columns = [
        { header: 'sdg', key: 'sdg' },
      ];

      data.predictions.forEach((prediction) => {
        worksheet.addRow({ sdg: prediction });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      saveAs(blob, 'predictions.xlsx');
    } else if (data.predictions && data.predictions.length === 1) {
      setClassification(data.category);

        const categoryMappings = {
          3: 'ODS 3',
          4: 'ODS 4',
          5: 'ODS 5',
        };

        setDescription(getCategoryInfo(categoryMappings[data.predictions[0]]));
        setShowResult(true);
    }
  };

  const textToExcel = (text) => {
    // Split the input text into an array of rows
    const rows = text.split('\n').map((row) => [row]);

    // Add the header row as the first element
    rows.unshift(['Textos_espanol', 'sdg']);

    // Create a new workbook and add the rows to a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Convert the workbook to an ArrayBuffer
    const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob from the ArrayBuffer
    const blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Create a File from the Blob
    return new File([blob], 'text.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'ODS 3':
        return {
          title: 'ODS 3 - Salud y Bienestar',
          description: 'Garantizar una vida sana y promover el bienestar para todos en todas las edades.',
          icon: 'https://www.cincovientos.com/wp-content/uploads/2022/06/objetivo-3-2.jpg', // Reemplaza con el nombre del archivo de icono
        };
      case 'ODS 4':
        return {
          title: 'ODS 4 - Educación de Calidad',
          description: 'Garantizar una educación inclusiva, equitativa y de calidad, y promover oportunidades de aprendizaje durante toda la vida para todos.',
          icon: 'https://cecane3.com/wp-content/uploads/2019/10/4.jpg', // Reemplaza con el nombre del archivo de icono
        };
      case 'ODS 5':
        return {
          title: 'ODS 5 - Igualdad de Género',
          description: 'Lograr la igualdad entre los géneros y empoderar a todas las mujeres y las niñas.',
          icon: 'https://www.cincovientos.com/wp-content/uploads/2022/08/ODS-objetivo-5-0.jpg', // Reemplaza con el nombre del archivo de icono
        };
      default:
        return {
          title: 'Categoría no encontrada',
          description: 'No se encontró información para esta categoría.',
          icon: 'https://www.iconpacks.net/icons/2/free-sad-face-icon-2691-thumb.png', // Reemplaza con el nombre del archivo de icono predeterminado
        };
    }
  };

  return (
    <div className="text-classifier">
      <img
        className="img-principal"
        src="https://www.un.org/sustainabledevelopment/wp-content/uploads/2018/04/About_page_UNDP.png"
        alt="Header Image"
      />
      <h1 className="titulo">Clasificador de Textos ODS</h1>
      <div className="input-container">
        <div className="input-group">
          <textarea
            className="input"
            id="text-input"
            placeholder="Inserta tu texto aquí"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button className="button--submit" onClick={handleTextToExcel}>
            Clasificar
          </button>
          <input
            id="file-input"
            ref={fileInputRef}
            accept=".xlsx"
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="button--submit2">
            Seleccionar Archivo
          </label>
        </div>
      </div>
      {showResult && (
        <div className="result">
          <h2 className="subtitulo">Resultado de la Clasificación:</h2>
          <div className="card mb-3">
            <div className="row">
              <div className="col-3">
                <img
                  src={description.icon}
                  className="card-img-bottom imgODS" // Agrega la clase imgODS
                  alt="Icono del ODS"
                />
              </div>
              <div className="col-9">
                <div className="card-body">
                  <h5 className="card-title">{description.title}</h5>
                  <p className="card-text">{description.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="odsd-link">
        <div className="row">
          <div className="col-6 txtlink">
            <h2 className="subtitulo">Objetivos de Desarrollo Sostenible (ODS)</h2>
            <p className="p-subtitulo">
              Los Objetivos de Desarrollo Sostenible (ODS) constituyen un llamamiento universal a la acción para poner fin a la pobreza, proteger el planeta y mejorar las vidas y las perspectivas de las personas en todo el mundo. En 2015, todos los Estados Miembros de las Naciones Unidas aprobaron 17 Objetivos como parte de la Agenda 2030 para el Desarrollo Sostenible, en la cual se establece un plan para alcanzar los Objetivos en 15 años.
            </p>
          </div>
          <div className="col-6 imglink">
            <a
              href="https://www.un.org/sustainabledevelopment/es/objetivos-de-desarrollo-sostenible/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="img-ods"
                src="https://www.nosolofilms.org/wp-content/uploads/2021/04/objetivos-del-desarrollo-sostenible-.png"
                alt="Ir a los ODS"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextClassifier;
