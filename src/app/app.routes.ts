import { Routes } from '@angular/router';
import { ListarProfesorComponent } from './features/Profesor/listar-profesor/listar-profesor.component';
import { PerfilProfesorComponent } from './features/Profesor/perfil-profesor/perfil-profesor.component';
import { ListarCursosComponent } from './features/Cursos/listar-cursos/listar-cursos.component';
import { ListarAlumnosComponent } from './features/Alumnos/listar-alumnos/listar-alumnos.component';
import { PerfilAlumnoComponent } from './features/Alumnos/perfil-alumno/perfil-alumno.component';
import { CursoComponent } from './features/Cursos/curso/curso.component';
import { LoginComponent } from './auth/login/login.component';
import { FormComponent } from './auth/form/form.component';
import { IndexComponent } from './core/components/index/index.component';
import { ListarUsuariosComponent } from './features/Usuarios/listar-usuarios/listar-usuarios.component';

export const routes: Routes = [
  { path: 'profesores', component: ListarProfesorComponent },
  { path: 'profesor/:idProfesor', component: PerfilProfesorComponent },


  { path: 'cursos', component: ListarCursosComponent },
  { path: 'curso/:idCurso', component: CursoComponent },

  { path: 'alumnos', component: ListarUsuariosComponent },
  { path: 'alumno/:idAlumno', component: PerfilAlumnoComponent },

  { path: 'form', component: FormComponent },


  { path: '', component: IndexComponent },

  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  
];
