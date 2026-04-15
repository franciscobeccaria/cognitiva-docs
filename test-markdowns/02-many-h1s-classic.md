# Fundamentos de Machine Learning

Machine learning es la disciplina que permite a los sistemas aprender de datos sin ser explícitamente programados para cada tarea. Este documento cubre los conceptos fundamentales, los tipos de aprendizaje, las métricas más importantes y las trampas comunes.

## Qué es el aprendizaje automático

Un modelo de ML toma datos de entrada y produce una salida (predicción, clasificación, generación). La "inteligencia" está codificada en los parámetros aprendidos durante el entrenamiento, no en reglas escritas a mano.

> Un sistema que aprende a jugar al ajedrez derrotando a jugadores humanos no tiene programadas las reglas de una buena jugada — las infiere de millones de partidas.

## El flujo básico

1. **Datos** — recolección, limpieza y preparación
2. **Features** — transformar los datos en representaciones útiles
3. **Modelo** — elegir la arquitectura adecuada al problema
4. **Entrenamiento** — ajustar parámetros minimizando una función de pérdida
5. **Evaluación** — medir el desempeño en datos no vistos
6. **Deploy** — integrar el modelo en producción

# Tipos de Aprendizaje

La clasificación fundamental distingue tres paradigmas, cada uno con aplicaciones y algoritmos propios.

## Supervisado

El modelo aprende de ejemplos etiquetados: pares (entrada, salida esperada). Es el paradigma más común en aplicaciones comerciales.

| Tipo | Ejemplo | Algoritmos típicos |
|------|---------|-------------------|
| Regresión | Predecir precio de una casa | Linear Regression, Random Forest |
| Clasificación | Detectar spam | Logistic Regression, SVM, XGBoost |
| Sequence labeling | NER en texto | CRF, Transformers |

El riesgo principal es el **overfitting**: el modelo memoriza el training set y no generaliza.

## No Supervisado

Sin etiquetas. El modelo descubre estructura latente en los datos.

- **Clustering** (k-means, DBSCAN): agrupa instancias similares
- **Reducción dimensional** (PCA, UMAP): comprime representaciones
- **Modelos generativos** (VAE, GAN): aprenden la distribución de los datos

Útil cuando las etiquetas son costosas o inexistentes.

## Por Refuerzo

El agente aprende mediante ensayo y error interactuando con un entorno. Recibe recompensas por acciones que llevan a resultados deseados.

Es la base de AlphaGo, los sistemas de recomendación modernos y los modelos de lenguaje ajustados con RLHF.

# Métricas de Evaluación

Elegir la métrica incorrecta puede llevar a conclusiones engañosas sobre el desempeño real del modelo.

## Clasificación

En problemas de clasificación binaria, la matriz de confusión es el punto de partida:

```
              Predicho
              Pos    Neg
Real  Pos  [ TP  |  FN ]
      Neg  [ FP  |  TN ]
```

Las métricas derivadas:
- **Precision** = TP / (TP + FP) → de lo que predije positivo, ¿cuánto era realmente positivo?
- **Recall** = TP / (TP + FN) → de todo lo que era positivo, ¿cuánto detecté?
- **F1** = 2 × (Precision × Recall) / (Precision + Recall)

La **AUC-ROC** mide la capacidad discriminativa independiente del umbral de clasificación.

## Regresión

| Métrica | Fórmula | Cuándo usarla |
|---------|---------|---------------|
| MAE | mean(|y - ŷ|) | Outliers no críticos |
| MSE | mean((y - ŷ)²) | Penalizar errores grandes |
| RMSE | √MSE | Misma unidad que la variable objetivo |
| R² | 1 - SS_res/SS_tot | Varianza explicada (0 a 1) |

## Dataset Split

Nunca evaluéis el modelo en los mismos datos con los que lo entrenasteis:

- **Train** (70–80%): para ajustar parámetros
- **Validation** (10–15%): para hiperparámetros y decisiones de arquitectura
- **Test** (10–15%): evaluación final, solo una vez

# Trampas Comunes

Conocer los errores más frecuentes es tan importante como conocer los algoritmos.

## Data Leakage

El modelo ve información del futuro durante el entrenamiento. Resultado: métricas artificialmente buenas que colapsan en producción.

**Ejemplo clásico:** normalizar los datos usando estadísticas calculadas sobre todo el dataset (incluyendo el test set) antes de hacer el split.

**Solución:** siempre ajustá los transformadores solo sobre el training set y aplicalos al resto.

## Overfitting vs Underfitting

```
High bias (underfitting): modelo demasiado simple, no captura el patrón
High variance (overfitting): modelo demasiado complejo, memoriza el ruido
```

Soluciones para overfitting:
- Más datos
- Regularización (L1, L2, dropout)
- Reducir complejidad del modelo
- Early stopping

## Distributional Shift

Los datos de producción difieren de los de entrenamiento. Es el problema más subestimado en ML aplicado.

Monitoreá la distribución de entradas en producción y establecé alertas cuando se desvíen significativamente del training set.
