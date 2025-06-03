import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react"; 

const policies = [
    {
        title: "RESPONSABLE",
        content: (
            <div>
                <p>
                    <strong>Identidad:</strong> ZIMENTA OBRAS Y PROYECTOS, S.L.
                </p>
                <p>
                    <strong>CIF:</strong> B45638046
                </p>
                <p>
                    <strong>Domicilio:</strong> C/ Las Palmeras, 4 Nave A6 – P.I. La
                    Sendilla 28350 – Ciempozuelos (Madrid)
                </p>
                <p>
                    <strong>Teléfono:</strong> 918093601
                </p>
                <p>
                    <strong>Correo electrónico:</strong> administracion@zimenta.com
                </p>
            </div>
        ),
    },
    {
        title: "FINALIDAD",
        content: (
            <div>
                <p>
                    La normativa vigente en el ámbito de la protección de datos de
                    carácter personal se compone del Reglamento (UE) 2016/679 del
                    Parlamento Europeo y del Consejo de 27 de abril del 2016 (RGPD) y de
                    la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos
                    Personales y Garantía de los Derechos Digitales (LOPD).
                </p>
                <p>
                    De acuerdo con la normativa anteriormente citada, ZIMENTA OBRAS Y
                    PROYECTOS, S.L garantizará la confidencialidad de los datos personales
                    tratados. Para ello, adoptará las medidas técnicas y organizativas
                    necesarias.
                </p>
                <p>
                    En ZIMENTA OBRAS Y PROYECTOS, S.L trataremos su información para
                    poderle crear un presupuesto ajustado a sus necesidades y, en caso de
                    convertirse en cliente, necesitaremos su información para poder
                    ejercitar de manera eficiente la labor del servicio contratado.
                </p>
            </div>
        ),
    },
    {
        title: "LEGITIMACIÓN",
        content: (
            <div>
                <p>
                    El tratamiento de sus datos es necesario para ejecución del contrato
                    entre las partes o en su caso para la presentación del presupuesto
                    personalizado.. Adicionalmente, el tratamiento de sus datos está
                    basado en el consentimiento que se le solicita en el contrato que le
                    vincula con ZIMENTA OBRAS Y PROYECTOS, S.L.
                </p>
            </div>
        ),
    },
    {
        title: "DERECHOS QUE LE ASISTEN A LAS PERSONAS INTERESADAS",
        content: (
            <div>
                <p>
                    Puede ejercitar cualquiera de los siguientes derechos comunicándonoslo
                    a la dirección postal AVD/ LAS PALMERAS, 4. NAVE A 6 POLIG. IND o a la
                    dirección electrónica indicada en el encabezado
                    (aranchasoria@zimenta.com). En todo caso, según la normativa vigente
                    tiene reconocido el:
                </p>
                <ul>
                    <li>
                        Derecho a solicitar el acceso a los datos personales relativos al
                        interesado.
                    </li>
                    <li>Derecho a solicitar su rectificación o supresión.</li>
                    <li>Derecho a solicitar la limitación del tratamiento.</li>
                    <li>Derecho a oponerse al tratamiento.</li>
                    <li>Derecho a la portabilidad.</li>
                </ul>
                <p>
                    Podrá hacer uso de los siguientes formularios para poder ejercitar sus
                    derechos de una manera más fácil: MODELO DE EJERCICIO DEL DERECHO DE
                    LIMITAR LAS DECISIONES INVIDUALES AUTOMATIZADAS, MODELO DE EJERCICIO
                    DEL DERECHO DE OPOSICION, MODELO DERECHO DE ACCESO, MODELO DERECHO DE
                    LIMITACION DEL TRATAMIENTO, MODELO DERECHO DE PORTABILIDAD, MODELO
                    DERECHO DE RECTIFICACION, MODELO DERECHO DE SUPRESION
                </p>
                <p></p>
            </div>
        ),
    },
    {
        title: "DESTINATARIOS",
        content: (
            <div>
                <p>
                    Sus datos no serán comunicados a terceras empresas. Asimismo, le
                    informamos que sus datos no se transferirán internacionalmente a
                    ningún tercer país
                </p>
            </div>
        ),
    },
    {
        title: "PROCEDENCIA DE SUS DATOS",
        content: (
            <div>
                <p>
                    Los datos de carácter personal que utiliza ZIMENTA OBRAS Y PROYECTOS,
                    S.L proceden del propio interesado.
                </p>
                <ul>
                    <li>Datos de identificación</li>
                    <li>Códigos o claves de identificación.</li>
                    <li>Direcciones postales o electrónicas.</li>
                    <li>Información comercial</li>
                    <li>Datos económicos</li>
                    <li>Curriculum vitae</li>
                </ul>
                <p>
                    ZIMENTA OBRAS Y PROYECTOS, S.L no trata datos especialmente
                    protegidos.
                </p>
            </div>
        ),
    },
    {
        title: "AUTORIDAD DE CONTROL",
        content: (
            <div>
                <p>
                    Desde ZIMENTA OBRAS Y PROYECTOS, S.L v ponemos el máximo empeño para
                    cumplir con la normativa de protección de datos dado que es el activo
                    más valioso para nosotros. No obstante, le informamos que en caso de
                    que usted entienda que sus derechos se han visto menoscabados, puede
                    presentar una reclamación ante la Agencia Española de Protección de
                    Datos (en adelante AEPD), sita en C/ Jorge Juan, 6. 28001 – Madrid.
                    Más información sobre la AEPD. http://www.agpd.es/
                </p>
            </div>
        ),
    },
];

export default function PrivacyPolicy() {
    const [expanded, setExpanded] = useState(null);
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="container my-5">
            <div className="d-flex align-items-center mb-4">
                <button
                    onClick={handleGoBack}
                    className="btn btn-link p-0 me-2"
                    aria-label="Volver atrás"
                    style={{ color: "orange" }}
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-center mb-0" style={{ color: "orange", flexGrow: 1 }}>
                    Política de Privacidad
                </h1>
                <div style={{ width: '24px', visibility: 'hidden' }}>
  
                    <ChevronLeft size={24} color="transparent" />
                </div>
            </div>
            <div className="row">
                {policies.map((policy, index) => (
                    <div
                        key={index}
                        className="col-md-4 mb-3"
                    >
                        <div
                            className={`card ${expanded === index ? "border-primary" : ""}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => setExpanded(expanded === index ? null : index)}
                        >
                            <div className="card-body">
                                <h5 className="card-title">{policy.title}</h5>
                                {expanded === index ? (
                                    <div>{policy.content}</div>
                                ) : (
                                    <p className="card-text">Haz clic para ver más...</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}