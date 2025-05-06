import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react"; // Importa el icono

const terms = [
  {
    title: "Datos identificativos del titular del Sitio Web",
    content: (
        <div>
          <p>
            En cumplimiento del deber de información estipulado en el artículo 10
            de la Ley 34/2002 de 11 de julio de Servicios de la Sociedad de la
            Información y de Comercio Electrónico, ZIMENTA, OBRAS Y PROYECTOS,
            S.L. (en lo sucesivo, “ZIMENTA”) y en calidad de titular del App
            , procede a comunicarles los datos identificativos
            exigidos por la referida norma:
          </p>
          <p>
            <strong>Denominación social:</strong> ZIMENTA OBRAS Y PROYECTOS, S.L.
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
            <strong>Correo electrónico:</strong> info@zimenta.com
          </p>
          <p>
            La presente información conforma y regula las condiciones de uso, las
            limitaciones de responsabilidad y las obligaciones que, los usuarios
            de la App que se publica bajo el nombre de dominio
            www.zimenta.com, asumen y se comprometen a respetar.
          </p>
        </div>
    ),
  },
  {
    title: "Condiciones de uso",
    content: (
        <div>
          <p>
            La simple y mera utilización de la App otorga la condición de
            usuario de la App, bien sea persona física o jurídica, y
            obligatoriamente implica la aceptación completa, plena y sin reservas
            de todas y cada una de las cláusulas y condiciones generales incluidas
            en el Aviso Legal. Si el Usuario no estuviera conforme con las
            cláusulas y condiciones de uso de este Aviso Legal, se abstendrá de
            utilizar la App.
          </p>
          <p>
            Este Aviso Legal está sujeto a cambios y actualizaciones, por lo que
            la versión publicada por ZIMENTA puede ser diferente en cada momento
            en que el Usuario acceda al Portal. Por tanto, el Usuario debe leer el
            Aviso Legal en todas y cada una de las ocasiones en que acceda a la
            App.
          </p>
          <p>
            A través de la App, ZIMENTA facilita a los Usuarios el acceso y la
            utilización de diversos Contenidos publicados por medio de Internet
            por ZIMENTA o por terceros autorizados.
          </p>
          <p>
            El Usuario está obligado y se compromete a utilizar la App y los
            Contenidos de conformidad con la legislación vigente, el Aviso Legal,
            y cualquier otro aviso o instrucciones puestos en su conocimiento,
            bien sea por medio de este aviso legal o en cualquier otro lugar
            dentro de los Contenidos que conforman la App, así como con las
            normas de convivencia, la moral y buenas costumbres generalmente
            aceptadas.
          </p>
          <p>
            A tal efecto, el Usuario se obliga y compromete a no utilizar
            cualquiera de los Contenidos con fines o efectos ilícitos, prohibidos
            en el Aviso Legal o por la legislación vigente, lesivos de los
            derechos e intereses de terceros, o que de cualquier forma puedan
            dañar, inutilizar, sobrecargar, deteriorar o impedir la normal
            utilización de los Contenidos, los equipos informáticos o los
            documentos, archivos y toda clase de contenidos almacenados en
            cualquier equipo informático propios o contratados por ZIMENTA, de
            otros Usuarios o de cualquier usuario de Internet (hardware y
            software).
          </p>
          <p>
            El Usuario se obliga y se compromete a no transmitir, difundir o poner
            a disposición de terceros cualquier clase de material incluido en la
            App, tales como informaciones, textos, datos, contenidos, mensajes,
            gráficos, dibujos, archivos de sonido y/o imagen, fotografías,
            grabaciones, software, logotipos, marcas, iconos, tecnología,
            fotografías, software, enlaces, diseño gráfico y códigos fuente, o
            cualquier otro material al que tuviera acceso en su condición de
            Usuario de la App, sin que esta enumeración tenga carácter
            limitativo.
          </p>
        </div>
    ),
  },
  {
    title: "Propiedad intelectual",
    content: (
        <div>
          <p>
            Todas las marcas, nombres comerciales o signos distintivos de
            cualquier clase que aparecen en la App son propiedad de ZIMENTA o,
            en su caso, de terceros que han autorizado su uso, sin que pueda
            entenderse que el uso o acceso al App y/o a los Contenidos
            atribuya al Usuario derecho alguno sobre las citadas marcas, nombres
            comerciales y/o signos distintivos, y sin que puedan entenderse
            cedidos al Usuario, ninguno de los derechos de explotación que existen
            o puedan existir sobre dichos Contenidos.
          </p>
          <p>
            De igual modo los Contenidos son propiedad intelectual de ZIMENTA, o
            de terceros en su caso, por tanto, los derechos de Propiedad
            Intelectual son titularidad de ZIMENTA o de terceros que han
            autorizado su uso, a quienes corresponde el ejercicio exclusivo de los
            derechos de explotación de los mismos en cualquier forma y, en
            especial, los derechos de reproducción, distribución, comunicación
            pública y transformación.
          </p>
          <p>
            La utilización no autorizada de la información contenida en esta Web,
            así como la lesión de los derechos de Propiedad Intelectual o
            Industrial de ZIMENTA o de terceros incluidos en la App que hayan
            cedido contenidos dará lugar a las responsabilidades legalmente
            establecidas.
          </p>
        </div>
    ),
  },
  {
    title: "Hiperenlaces",
    content: (
        <div>
          <p>
            Aquellas personas que se propongan establecer hiperenlaces entre su
            App y la App deberán observar y cumplir las condiciones
            siguientes: - No será necesaria autorización previa cuando el
            Hiperenlace permita únicamente el acceso a la App de inicio, pero
            no podrá reproducirla de ninguna forma. Cualquier otra forma de
            Hiperenlace requerirá la autorización expresa e inequívoca por escrito
            por parte de ZIMENTA. - No se crearán “marcos” (“frames”) con las
            Apps Web ni sobre las Apps Web de ZIMENTA. - No se realizarán
            manifestaciones o indicaciones falsas, inexactas, u ofensivas sobre
            ZIMENTA sus directivos, sus empleados o colaboradores, o de las
            personas que se relacionen en la App por cualquier motivo, o de los
            Usuarios de las App, o de los Contenidos suministrados. - No se
            declarará ni se dará a entender que ZIMENTA ha autorizado el
            Hiperenlace o que ha supervisado o asumido de cualquier forma los
            Contenidos ofrecidos o puestos a disposición de la App en la
            que se establece el Hiperenlace. -La App en la que se
            establezca el Hiperenlace solo podrá contener lo estrictamente
            necesario para identificar el destino del Hiperenlace. - La App
            en la que se establezca el Hiperenlace no contendrá informaciones o
            contenidos ilícitos, contrarios a la moral y a las buenas costumbres
            generalmente aceptadas y al orden público, así como tampoco contendrá
            contenidos contrarios a cualesquiera derechos de terceros.
          </p>
        </div>
    ),
  },
  {
    title: "Cookies",
    content: (
        <div>
          <p>
            Las cookies son el medio técnico para la “trazabilidad” y seguimiento
            de la navegación en los Sitios Web. Son pequeños ficheros de texto que
            se escriben en el ordenador del Usuario. Este método tiene
            implicaciones sobre la privacidad, por lo que ZIMENTA informa de que
            podrá utilizar cookies con la finalidad de elaborar estadísticas de
            utilización del Sitio Web así como para identificar el PC del Usuario
            permitiendo reconocerle en sus próximas visitas. En todo caso, el
            usuario puede configurar su navegador para no permitir el uso de
            cookies en sus visitas al App.
          </p>
        </div>
    ),
  },
  {
    title: "Protección de Datos de Carácter Personal",
    content: (
        <div>
          <p>
            En cumplimiento de la Ley Orgánica 15/1999, de 13 de diciembre, de
            Protección de Datos de Carácter Personal y el Real Decreto 1720/2007
            de desarrollo, ZIMENTA le informa que los datos personales facilitados
            por el Usuario a través de nuestro App, serán incorporados a un
            fichero, cuyo responsable y titular es ZIMENTA. Asimismo, informamos
            al Usuario que la finalidad de la recogida de sus datos de carácter
            personal tiene como único objeto el normal desarrollo de la actividad
            que ejerce ZIMENTA.
          </p>
          <p>
            A todos los efectos, ZIMENTA es el destinatario final de la
            información recabada, sin perjuicio de que los datos de carácter
            personal objeto del tratamiento podrán ser comunicados a un tercero,
            para el cumplimiento de fines directamente relacionados con las
            funciones legítimas del Usuario y de ZIMENTA. Al aceptar el envío de
            los datos a través de nuestro App, el Usuario presta su
            consentimiento expreso a la recogida y tratamiento de sus datos de
            carácter personal, y a recibir comunicaciones comerciales de los
            servicios y de la actividad de ZIMENTA.
          </p>
          <p>
            Del mismo modo, comunicamos al Usuario que puede ejercitar sus
            derechos de acceso, rectificación, cancelación y oposición a los datos
            contenidos en el fichero, mediante el envío por correo ordinario de su
            solicitud por escrito a la siguiente dirección, incluyendo copia del
            DNI o documento identificativo equivalente: CALLE PALMERAS 4, NAVE A6
            – POL. IND. LA SENDILLA. 28350 – CIEMPOZUELOS (MADRID), o bien a
            través de info@zimenta.com.
          </p>
        </div>
    ),
  },
  {
    title: "Jurisdicción",
    content: (
        <div>
          <p>
            Para cuantas cuestiones se susciten sobre la interpretación,
            aplicación y cumplimiento de este Aviso Legal, así como de las
            reclamaciones que puedan derivarse de su uso, todos las partes
            intervinientes se someten a los Jueces y Tribunales de Madrid,
            renunciando de forma expresa a cualquier otro fuero que pudiera
            corresponderles.
          </p>
        </div>
    ),
  },
  {
    title: "Legislación aplicable",
    content: (
        <div>
          <p>
            El Aviso Legal se rige por la ley española. Copyright© ZIMENTA.
            Reservados todos los derechos de autor por las leyes y tratados
            internacionales de propiedad intelectual. Queda expresamente prohibida
            su copia, reproducción o difusión, total o parcial, por cualquier
            medio.
          </p>
        </div>
    ),
  },
  {
    title: "Política de privacidad. Protección de Datos",
    content: (
        <div>
          <p>
            ZIMENTA OBRAS Y PROYECTOS, S.L es consciente de la importancia de la
            protección de datos, así como de la privacidad de EL USUARIO y por
            ello, ha implementado una política de tratamiento de datos orientada a
            proveer la máxima seguridad en el uso y recogida de los mismos,
            garantizando el cumplimiento de la normativa vigente en la materia y
            configurando dicha política como uno de los pilares básicos en las
            líneas de actuación de la entidad. Por ello, ZIMENTA OBRAS Y
            PROYECTOS, S.L insiste en la lectura obligada de su “Política de
            Privacidad”.
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
            Aviso Legal e información sobre las condiciones de uso de la Aplicación
          </h1>
          <div style={{ width: '24px', visibility: 'hidden' }}>
            {/* Espacio oculto para mantener el centrado */}
            <ChevronLeft size={24} color="transparent" />
          </div>
        </div>
        <div className="row">
          {terms.map((policy, index) => (
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