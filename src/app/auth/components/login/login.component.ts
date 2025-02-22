import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserCredentials } from '../../usuario.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../service/auth.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, MatDialogModule, MatDividerModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginUser!: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<LoginComponent>,
    private router: Router,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: UserCredentials
  ) {
    this.loginUser = new FormGroup({
      email: new FormControl(data.email, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl(data.password, [Validators.required]),
    });
  }

  registrarse() {
    this.dialogRef.close();

    this.router.navigate(['/auth/registrarse']);
  }

  loginGoogle() {
    this.authService
      .loginWithGoogle()
      .then((response) => {
        if (response.newUser) {
          this.router.navigate(['/form']); // Redirigir al formulario
        } else {
          this.router.navigate(['/cursos']); // Redirigir a la página de cursos
        }
        this.dialogRef.close();
      })
      .catch((error) => console.log(error));
  }

  enviarForm() {
    console.log(this.loginUser.value);

    this.authService
      .login(this.loginUser.value)
      .then(() => {
        // Cierra el diálogo
        this.dialogRef.close();
        // Redirige a otra página
        this.router.navigate(['/cursos']);
      })
      .catch((error) => console.log(error));
  }
}
