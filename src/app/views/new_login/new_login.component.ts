import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiRestService } from 'src/app/services/usuarios/api-rest.service';
import { SPasswordService } from '../password/-s-password.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { FLogin } from '../login/clsLogin.class';
import { FormControl, ReactiveFormsModule, FormsModule  } from '@angular/forms';
import { showToast } from '../../shared/toast/toastComponent.js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-login',
  templateUrl: './new_login.component.html',
  styleUrls: ['./new_login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class NewLoginComponent {

  empresas: any = [];
  username = new FormControl('');
  digitos: number[] = []; // Almacena los dígitos ingresados

  loginForm: any = {
    usuario : '',
    contrasena : '',
    empresa : ''
  };

  constructor(
    private sData: ApiRestService,
    private _sdatosPaswword: SPasswordService,
    private auth: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // this.FLogin = { USUARIO: '', PASSWORD: '', EMPRESA: '', ID_UN_ASOCIADA: ''};
  };

  isComplete(): boolean {
    return this.digitos.every(d => d !== null && d >= 0 && d <= 9);
  }

  onDigitInput(index: number) {
    if (this.digitos[index] && this.digitos[index].toString().length > 1) {
      const digitsArray = this.digitos[index].toString().split('');
      digitsArray.forEach((digit, i) => {
        if (index + i < this.digitos.length) {
          this.digitos[index + i] = +digit;
        }
      });
    }
  }

  onChangePassword(e:any, prm:any) {
    if(prm === 'aceptar') {
      const front_face:any = document.querySelector('.face-front');
      front_face.style.transform = 'rotateY(-180deg)';
      const front_back:any = document.querySelector('.face-back');
      front_back.style.transform = 'rotateY(0deg)';
    };
    if(prm === 'salir') {
      const front_face:any = document.querySelector('.face-front');
      front_face.style.transform = 'rotateY(0deg)';
      const front_back:any = document.querySelector('.face-back');
      front_back.style.transform = 'rotateY(-180deg)';
      const from_padre:any = document.querySelector('.from-padre');
      from_padre.style.transition = '.2s ease-out';
      from_padre.style.transform = 'translateX(0%)';
    };
    if(prm === 'validar') {
      const from_padre:any = document.querySelector('.from-padre');
      from_padre.style.transition = '.2s ease-out';
      from_padre.style.transform = 'translateX(-50%)';
      //const front_back:any = document.querySelector('.face-back');
      //front_back.style.transform = 'rotateY(-180deg)';
    };

  }

  // focusOutFunction(e: any) {
  //   this.username = e.value;
  //   if (this.username.length >= 5) {
  //     const prm = {USUARIO: this.username.value};
  //     this.sData.usuarioValido('USUARIO VALIDO', prm).subscribe((data: any)=> {
  //       const res = JSON.parse(data);
  //       const mensaje = res[0].ErrMensaje;
  //       if ( mensaje != ''){
  //         this.showModal(mensaje);
  //       } else {
  //         this.displayPassword = res[0].CAMBIAR_CLAVE;
  //         const data:any = { CAMBIO_PASSWORD: this.displayPassword, USUARIO: this.username.value };
  //         this._sdatosPaswword.setPassword(data);
  //         this.empresas = res[0].EMPRESAS;
  //         this.FLogin.ID_UN_ASOCIADA = res[0].ID_UN_ASOCIADA;
  //       }
  //     });
  //   }
  // };

  focusOutFunction(e: any) {
    const prm = {USUARIO: this.username.value};
    this.sData.usuarioValido('USUARIO VALIDO', prm).subscribe((data: any)=> {
      const res = JSON.parse(data);
      const mensaje = res[0].ErrMensaje;
      if ( mensaje != ''){
        this.showModal(mensaje);
      }
      else {
        this.empresas = res;
      }
    });
  };

  // onValueChangedPassword(e:any) {
  //   this.FLogin.PASSWORD = e.value;
  // }

  // onValueChangedEmpresa(e:any) {
  //   this.FLogin.EMPRESA = e.value;
  // }

  login(loginForm:any){
    // if (this.onValidator()) {
      this.auth.login(loginForm);
      let nombreEmpresa = this.empresas.find((e:any) => e.ID_UN === loginForm.EMPRESA);    
      localStorage.setItem("nombre empresa", nombreEmpresa.NOMBRE);
    // };
  }

  // onValidator() {
  //   if (this.FLogin.USUARIO.length < 5) {
  //     showToast('El usuario es invalido', 'error');
  //     return false
  //   };
  //   if (this.FLogin.USUARIO !== '' && this.FLogin.PASSWORD !== '' && this.FLogin.EMPRESA !== '') return true;
  //   else {
  //     showToast('Faltan datos por completar.', 'error');
  //     return false;
  //   }
  // }

  showModal(mensaje:any) {
		Swal.fire({
			iconHtml: "<i class='icon-cancelar-ol error-color'></i>",
      confirmButtonColor: '#0F4C81',
			title: 'Error!',
			text: mensaje,
			allowOutsideClick: true,
			allowEscapeKey: false,
			allowEnterKey: false,
			backdrop: true,
			position: 'center',
			stopKeydownPropagation: false,
		});
	}


}
