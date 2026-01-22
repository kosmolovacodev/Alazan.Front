<CatalogTable
  title="📍 Orígenes"
  :columns="['Municipio', 'Estado', 'Activo']"
  :items="rows"
  button-text="Agregar"
  @add="abrirModalAlta"
  @delete="borrarRegistro"
  @change="guardarCambiosEnVivo"
/>
