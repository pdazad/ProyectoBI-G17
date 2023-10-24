import React, { useState } from 'react';
import './TextClassifier.css';

function TextClassifier() {
  const [inputText, setInputText] = useState('');
  const [classification, setClassification] = useState('');
  const [description, setDescription] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Function to handle text submission and API request
  const handleSubmit = async () => {
    // Make an API request to classify the text
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (response.ok) {
        const data = await response.json();
        setClassification(data.category);

        // Set the description based on the category
        switch (data.category) {
          case 'ODS 3':
            setDescription('Description of Category 3');
            break;
          case 'ODS 4':
            setDescription('Description of Category 4');
            break;
          case 'ODS 5':
            setDescription('Description of Category 5');
            break;
          default:
            setDescription('Category not found');
            break;
        }

        setShowResult(true); 
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="text-classifier">
      <img className="img-principal" src="https://www.un.org/sustainabledevelopment/wp-content/uploads/2018/04/About_page_UNDP.png" alt="Header Image" />
      <h1 className='titulo'>Clasificador de Textos ODS</h1>
      <div className="input-container">
        <div className="input-group">
          <input
            type="text"
            className="input"
            id="text-input"
            placeholder="Inserta tu texto aquí"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <input
            className="button--submit"
            value="Clasificar"
            type="submit"
            onClick={handleSubmit}
          />
        </div>
      </div>
      {showResult && (
        <div className="result">
          <p>Classification: {classification}</p>
          <p>{description}</p>
        </div>
      )}
      <div className="odsd-link">
        <div className="row">
          <div className="col-6 txtlink">
            <h2 className='subtitulo'>Objetivos de Desarrollo Sostenible (ODS)</h2>
            <p className='p-subtitulo'>Los Objetivos de Desarrollo Sostenible (ODS) constituyen un llamamiento universal a la acción para poner fin a la pobreza, proteger el planeta y mejorar las vidas y las perspectivas de las personas en todo el mundo. En 2015, todos los Estados Miembros de las Naciones Unidas aprobaron 17 Objetivos como parte de la Agenda 2030 para el Desarrollo Sostenible, en la cual se establece un plan para alcanzar los Objetivos en 15 años.</p>
          </div>
          <div className="col-6 imglink">
            <a href="https://www.un.org/sustainabledevelopment/es/objetivos-de-desarrollo-sostenible/" target="_blank" rel="noopener noreferrer">
              <img className="img-ods"src="https://www.nosolofilms.org/wp-content/uploads/2021/04/objetivos-del-desarrollo-sostenible-.png" alt="Ir a los ODS" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextClassifier;
