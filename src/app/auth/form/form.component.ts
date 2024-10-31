import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { SharedModule } from '../../shared/shared.module';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { regexNumeros, regexTextos } from '../../shared/pattern/patterns';
import { User } from '../usuario.model';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [SharedModule, MatDividerModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  primerFormUsuario: FormGroup;
  segundoFormUsuario: FormGroup;
  isLinear = true;

  constructor(private authService: AuthService, private router: Router) {
    this.primerFormUsuario = new FormGroup({
      nombre: new FormControl('', [
        Validators.required,
        Validators.pattern(regexTextos),
        Validators.maxLength(30),
      ]),
      apellido: new FormControl('', [
        Validators.required,
        Validators.pattern(regexTextos),
        Validators.maxLength(30),
      ]),
      tipoUsuario: new FormControl('', [
        Validators.required,
        Validators.pattern(regexTextos),
        Validators.maxLength(13),
      ]),
    });

    this.segundoFormUsuario = new FormGroup({
      direccion: new FormControl('', [
        Validators.maxLength(50),
      ]),
      fechaNacimiento: new FormControl(''),
      telefono: new FormControl('', [
        Validators.pattern(regexNumeros),
        Validators.maxLength(15),
      ]),
    });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  async cargarDatosUsuario() {
    const userId = this.authService.obtenerIDUsuario();
    if (userId) {
      try {
        const userData = await this.authService.obtenerDatosUsuario(userId);
        if (userData) {
          this.primerFormUsuario.patchValue({
            nombre: userData.nombre,
            apellido: userData.apellido,
            tipoUsuario: userData.tipoUsuario,
          });

          this.segundoFormUsuario.patchValue({
            direccion: userData.direccion,
            fechaNacimiento: userData.fechaNacimiento,
            telefono: userData.telefono,
          });
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
      }
    }
  }

  enviarForm() {
    if (this.primerFormUsuario.invalid || this.segundoFormUsuario.invalid) {
      console.error('Formulario inválido');
      return;
    }

    const nuevoUsuario = {
      ...this.primerFormUsuario.value,
      ...this.segundoFormUsuario.value,
    };

    const userId = this.authService.obtenerIDUsuario();
    if (!userId) {
      console.error('No hay usuario autenticado. Iniciar sesión');
      this.router.navigate(['/auth/iniciar-sesion/']);
      return;
    }

    this.authService.agregarDatosUsuario(userId, nuevoUsuario)
      .then(() => {
        console.log('Datos guardados correctamente');
        this.router.navigate(['/cursos/']);
      })
      .catch((error) => {
        console.error('Error guardando datos: ', error);
      });
  }
}
