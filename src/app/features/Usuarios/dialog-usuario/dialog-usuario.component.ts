import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { regexTextos, regexMail, regexDireccion, regexNumeros } from '../../../shared/pattern/patterns';
import { Usuario } from '../model/usuario.model';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-dialog-usuario',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './dialog-usuario.component.html',
  styleUrl: './dialog-usuario.component.css'
})
export class DialogUsuarioComponent {
  formularioEditar: FormGroup;


  constructor(
    private dialogRef: MatDialogRef<DialogUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Usuario
  ) {
    this.formularioEditar = new FormGroup({
      nombre: new FormControl(data.nombre, [
        Validators.required,
        Validators.pattern(regexTextos),
      ]),
      apellido: new FormControl(data.apellido, [
        Validators.required,
        Validators.pattern(regexTextos),
      ]),
      correo: new FormControl(data.correo, [
        Validators.required,
        Validators.pattern(regexMail),
      ]),
      direccion: new FormControl(data.direccion, [
        Validators.pattern(regexDireccion),
      ]),
      fechaNacimiento: new FormControl(data.fechaNacimiento, [
        // Validators.required,
      ]),
      telefono: new FormControl(data.telefono, [
        Validators.pattern(regexNumeros),
      ]),
    });
  }

  aceptar() {
    if (this.formularioEditar.valid) {
      const formData = this.formularioEditar.value;
      console.log('Datos del formulario:', formData);
      this.dialogRef.close({
        ...formData,
        idUsuario: this.data.idUsuario,
      });
    } else {
      this.formularioEditar.markAllAsTouched();
    }
  }

  cancelar() {
    this.dialogRef.close();
  }
}
