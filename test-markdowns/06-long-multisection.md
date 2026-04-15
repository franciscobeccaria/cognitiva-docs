# Historia de Internet

Internet es la infraestructura de comunicación más transformadora de la historia humana. En pocas décadas pasó de ser un proyecto militar a ser el sistema nervioso de la economía global.

## Los Orígenes Militares

ARPANET nació en 1969 como proyecto de la Agencia de Proyectos de Investigación Avanzada de Defensa de Estados Unidos (DARPA). El objetivo era crear una red de comunicaciones que sobreviviera a un ataque nuclear: descentralizada, sin un punto único de fallo.

El primer mensaje enviado fue "lo" — el sistema colapsó antes de poder enviar "login". Era el 29 de octubre de 1969.

## La Capa de Protocolos

En 1974, Vint Cerf y Bob Kahn publicaron el paper que describiría TCP/IP: el lenguaje común que haría posible que diferentes redes se comunicaran entre sí.

> "La visión era que cualquier red pudiera conectarse con cualquier otra. No había una red central — la inteligencia estaba distribuida en los bordes."

TCP/IP resolvió el problema de la interoperabilidad. No importaba si tu red era telefónica, satelital o de radio: si hablaba TCP/IP, podía conectarse al resto.

# La Web y la Explosión Comercial

La web no es Internet — es una aplicación que corre sobre Internet. Tim Berners-Lee la inventó en 1989 en el CERN para facilitar el intercambio de documentos entre físicos.

## HTTP y HTML

El protocolo HTTP y el lenguaje HTML son los ladrillos de la web. La primera web tenía páginas estáticas: texto con links. Sin imágenes, sin estilos, sin interactividad.

El primer browser gráfico, Mosaic (1993), cambió todo. Por primera vez era posible navegar la web sin saber comandos de Unix. Las imágenes inline convirtieron la web en algo visualmente comprensible para el público general.

## La Burbuja Dot-com

Entre 1995 y 2000, el capital de riesgo fluyó hacia cualquier empresa con ".com" en el nombre. Los fundamentos financieros importaban poco.

| Empresa | Pico de valuación (2000) | Estado actual |
|---------|--------------------------|---------------|
| Pets.com | $82M en IPO | Cerró en 9 meses |
| Webvan | $1.2B | Quebró en 2001 |
| Amazon | $107 (acción) | ~$200 (2024) |
| Google | Fundada en 1998 | Sobrevivió y dominó |

El crash de 2001 destruyó $5 trillones en valor de mercado. Las empresas que sobrevivieron tenían modelos de negocio reales.

## Google y el Search

Antes de Google, la web era un caos de directorios editados manualmente (Yahoo!) y motores de búsqueda que indexaban texto sin entender relevancia.

PageRank fue la innovación clave: medir la importancia de una página por la cantidad y calidad de otras páginas que la enlazaban. La lógica era brillante: los links son votos, y no todos los votos valen igual.

# La Era Social

El período 2004–2012 transformó la web de un sistema de publicación en un sistema de comunicación.

## Redes Sociales

Facebook, fundado en 2004, popularizó el perfil como unidad fundamental de identidad online. Cada persona tenía un grafo de conexiones, una línea de tiempo, un registro público de actividad.

El modelo de negocio era simple en teoría: atención por publicidad. En la práctica, implicaba diseñar sistemas optimizados para maximizar el tiempo en pantalla, independientemente del valor entregado al usuario.

## El Smartphone y la Ubicuidad

El iPhone (2007) y Android (2008) no solo pusieron Internet en el bolsillo — cambiaron la naturaleza de la conectividad. La web dejó de ser algo que "usabas" para convertirse en algo que "eras".

Consecuencias:
- El tiempo de pantalla se multiplicó por factores de 5-10x
- Las aplicaciones nativas compitieron con la web abierta
- La geolocalización, la cámara y los sensores crearon nuevas categorías de aplicaciones

## La Economía de la Atención

La combinación de redes sociales + smartphones creó lo que se llama la economía de la atención: un mercado donde el recurso escaso no es el dinero sino el tiempo de las personas.

> La atención humana es finita. Cuando alguien está en TikTok no está leyendo un libro, hablando con un amigo o durmiendo.

# Infraestructura Moderna

La web actual corre sobre una infraestructura radicalmente distinta a la de los años 90.

## Cloud Computing

Amazon Web Services (2006), Google Cloud (2008) y Azure (2010) democratizaron el acceso a infraestructura de escala.

Antes del cloud, lanzar un servicio implicaba comprar servidores, alquilar espacio en un datacenter y esperar semanas. Hoy, en minutos podés tener cientos de servidores en múltiples regiones.

El cloud creó un nuevo modelo económico: capex en opex. Los costos fijos se convirtieron en variables.

## CDNs y la Distribución Global

Una CDN (Content Delivery Network) replica el contenido en servidores distribuidos globalmente. Cuando un usuario en Buenos Aires accede a un sitio hosteado en Virginia, recibe el contenido desde el nodo más cercano.

El resultado: latencias de milisegundos en lugar de cientos de milisegundos. La velocidad percibida de la web mejoró radicalmente con la adopción de CDNs.

## Protocolos Modernos

HTTP/2 (2015) y HTTP/3 (2022) resolvieron las ineficiencias del protocolo original:

| Protocolo | Conexiones | Multiplexing | Transporte |
|-----------|-----------|-------------|-----------|
| HTTP/1.1 | Una por request | No | TCP |
| HTTP/2 | Una por dominio | Sí | TCP |
| HTTP/3 | Una por dominio | Sí | QUIC (UDP) |

HTTP/3 sobre QUIC elimina el "head-of-line blocking" que afectaba a HTTP/2 en redes con pérdida de paquetes.

# El Futuro

Internet sigue evolucionando. Algunas tendencias que definirán la próxima década:

## Descentralización

Web3, blockchain, y protocolos como ActivityPub buscan reducir la dependencia de plataformas centralizadas. El Fediverso (Mastodon, Pixelfed) es un ejemplo temprano de redes sociales federadas.

## IA e Internet

Los modelos de lenguaje están cambiando la forma en que las personas interactúan con la información. La búsqueda tradicional —lista de links— está siendo reemplazada por respuestas generadas.

La web que alimentó el entrenamiento de estos modelos fue construida por humanos. La web que generarán los modelos será principalmente artificial. Las implicaciones para la ecología de la información son inciertas.

## Conclusión

Internet pasó de ser un experimento militar a ser la infraestructura más importante de la civilización contemporánea en menos de 60 años. Cada capa — los protocolos, la web, las redes sociales, el cloud — fue construida sobre la anterior y transformó lo que era posible.

Lo que viene después depende, en parte, de las decisiones de diseño que tomemos hoy.
