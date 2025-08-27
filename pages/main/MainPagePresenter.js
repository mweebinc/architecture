class MainPagePresenter {
  constructor(page, getSchemasUseCase) {
    this.page = page;
    this.getSchemasUseCase = getSchemasUseCase;
  }

  async initialize() {
    await this.loadSchemas();
  }

  async loadSchemas() {
    try {
      this.page.showLoading();
      const schemas = await this.getSchemasUseCase.execute();
      this.page.setSchemas(schemas);
      this.page.hideLoading();
    } catch (error) {
      this.page.hideLoading();
      this.page.showError(error.message);
    }
  }
}

export default MainPagePresenter;
