import { Tab } from "src/app/containers/tabs/tab.model";
import { ADM015Component } from "src/app/modulos/ADM015/ADM015.component";
import { ADM301Component } from "src/app/modulos/ADM301/ADM301.component";
import { ADM400Component } from "src/app/modulos/ADM400/ADM400.component";
import { TableroComponent } from '../../containers/tablero/tablero.component';
import { InformesComponent } from "src/app/modulos/GEN/informes/informes.component";
import { VEN155Component } from "src/app/modulos/VEN155/VEN155.component";
import { ADM401Component } from "src/app/modulos/ADM401/ADM401.component";
import { HOR001Component } from "src/app/modulos/HOR001/HOR001.component";
import { HOR002Component } from "src/app/modulos/HOR002/HOR002.component";
import { HOR003Component } from "src/app/modulos/HOR003/HOR003.component";
import { HOR004Component } from "src/app/modulos/HOR004/HOR004.component";
import { HOR005Component } from "src/app/modulos/HOR005/HOR005.component";
import { BAN001Component } from "src/app/modulos/BAN001/BAN001.component";
import { BAN010Component } from "src/app/modulos/BAN010/BAN010.component";
import { BAN011Component } from "src/app/modulos/BAN011/BAN011.component";
import { BAN005Component } from "src/app/modulos/BAN005/BAN005.component";
import { BAN002Component } from "src/app/modulos/BAN002/BAN002.component";
import { BAN003Component } from "src/app/modulos/BAN003/BAN003.component";
import { BAN012Component } from "src/app/modulos/BAN012/BAN012.component";

export const tabs: Tab[] = [
  new Tab(ADM015Component, "Usuarios", { parent: "PrincipalComponent" }, 'ADM-015', 'icon usuarios-sl-rd', '', false),
  new Tab(ADM301Component, "Calendario", { parent: "PrincipalComponent" }, 'ADM-301', 'icon calendar-sl', '', false),
  new Tab(ADM400Component, "Configuración de Códigos", { parent: "PrincipalComponent" }, 'ADM-400', 'icon password-ol', '', false),
  new Tab(TableroComponent, "Tablero", { parent: "PrincipalComponent" }, 'ADM-300', 'icon inicio-apps', '', false),
  new Tab(VEN155Component, "Pedidos", { parent: "PrincipalComponent" }, 'VEN-155', 'icon pedido-sl', '', false),
  new Tab(InformesComponent, "Informes", { parent: "PrincipalComponent" }, 'INF-000', 'icon informes', '', false),
  new Tab(ADM401Component, "Configurador de Consultas", { parent: "PrincipalComponent" }, 'ADM-401', 'icon-buscar-opciones', '', false),
  new Tab(HOR001Component, "Propietarios", { parent: "PrincipalComponent" }, 'HOR-001', 'icon-buscar-opciones', '', false),
  new Tab(HOR002Component, "Inmuebles", { parent: "PrincipalComponent" }, 'HOR-002', 'icon-buscar-opciones', '', false),
  new Tab(HOR003Component, "Tarifas", { parent: "PrincipalComponent" }, 'HOR-003', 'icon-buscar-opciones', '', false),
  new Tab(HOR004Component, "Facturación", { parent: "PrincipalComponent" }, 'HOR-004', 'icon-buscar-opciones', '', false),
  new Tab(HOR005Component, "Recaudos", { parent: "PrincipalComponent" }, 'HOR-005', 'icon-buscar-opciones', '', false),
  new Tab(BAN001Component, "Usuarios", { parent: "PrincipalComponent" }, 'BAN-001', 'icon-buscar-opciones', '', false),
  new Tab(BAN002Component, "Productos", { parent: "PrincipalComponent" }, 'BAN-002', 'icon-buscar-opciones', '', false),
  new Tab(BAN003Component, "Clientes", { parent: "PrincipalComponent" }, 'BAN-003', 'icon-buscar-opciones', '', false),
  new Tab(BAN005Component, "Secciones", { parent: "PrincipalComponent" }, 'BAN-005', 'icon-buscar-opciones', '', false),
  new Tab(BAN010Component, "Cortes", { parent: "PrincipalComponent" }, 'BAN-010', 'icon-buscar-opciones', '', false),
  new Tab(BAN011Component, "Consulta Cotizaciones", { parent: "PrincipalComponent" }, 'BAN-011', 'icon-buscar-opciones', '', false),
  new Tab(BAN012Component, "Cotizaciones", { parent: "PrincipalComponent" }, 'BAN-012', 'icon-buscar-opciones', '', false),

];