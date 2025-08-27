import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../../components/MainLayout";
import Sidebar from "../../components/Sidebar";
import NavSidebar from "../../components/NavSidebar";
import DashboardPage from "../dashboard";
import CollectionListPage from "../collection-list";
import CollectionFormPage from "../collection-form";
import TestPage from "../test";
import BasePage from "../../base/BasePage";
import MainPagePresenter from "./MainPagePresenter";
import { getSchemasUseCase } from "../../usecases/schema";

class MainPage extends BasePage {
  constructor(props) {
    super(props);
    this.presenter = new MainPagePresenter(this, getSchemasUseCase);
  }

  async componentDidMount() {
    this.presenter.loadSchemas();
  }

  render() {
    if (this.state.loading) {
      return this.renderLoading();
    }
    return (
      <MainLayout>
        <MainLayout.Context.Consumer>
          {(context) => {
            return (
              <>
                <Sidebar show={context.show} onSetShow={context.setShow} position="left" className="bg-white" isMobile={context.isMobile}>
                  <NavSidebar context={context} />
                </Sidebar>
                <main className="flex-1 min-h-screen bg-gray-50 w-full">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/test" element={<TestPage />} />
                    <Route path="/collections/:collection" element={<CollectionListPage />} />
                    <Route path="/collections/:collection/form" element={<CollectionFormPage />} />
                    <Route path="/collections/:collection/form/:id" element={<CollectionFormPage />} />
                  </Routes>
                </main>
              </>
            );
          }}
        </MainLayout.Context.Consumer>
      </MainLayout>
    );
  }
}

export default MainPage;
