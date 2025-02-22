import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';
import { UsuariosService } from '../../Usuarios/service/usuarios.service';
import { SharedModule } from '../../../shared/shared.module';
import { NuevoUsuario, Usuario } from '../model/usuario.model';
import { DialogUsuarioComponent } from '../dialog-usuario/dialog-usuario.component';

@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './listar-usuarios.component.html',
  styleUrl: './listar-usuarios.component.css'
})
export class ListarUsuariosComponent {
  usuarios$!: Usuario[];
  displayedColumns: string[] = [
    'Nombre',
    'Contacto',
    'InformacionAdicional',
    'Direccion',
    'Detalle',
    'Acciones',
  ];

  // DataSource de los usuarios
  dataSource = new MatTableDataSource<Usuario>();

  // Control para mostrar tabla de eliminados
  showDeletedTable: boolean = false;

  // @ViewChild(MatPaginator) permite acceder al componente MatPaginator en tu plantilla
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private dialog: MatDialog,
    private usuariosService: UsuariosService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.obtenerUsuariosActivos();
  }

  // Obtener usuarios normales
  obtenerUsuariosActivos() {
    this.usuariosService.obtenerUsuariosActivos().subscribe({
      next: (usuariosRecuperados) => {
        this.dataSource.data = usuariosRecuperados;  // Los datos recuperados se guardan en dataSource
        console.log('Usuarios:', usuariosRecuperados);
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
      },
    });
  }

  obtenerUsuariosEliminados() {
    this.usuariosService.obtenerUsuariosEliminados().subscribe({
      next: (usuariosEliminados) => {
        this.dataSource.data = usuariosEliminados;  // Los datos recuperados se guardan en dataSource
        console.log('Usuarios Eliminados:', usuariosEliminados);
      },
      error: (error) => {
        console.error('Error al obtener usuarios eliminados:', error);
      },
    });
  }

  // Función para mostrar usuarios activos o eliminados
  mostrarTablaUsuarios() {
    if (this.showDeletedTable) {
      // Si la tabla de eliminados ya está activa, mostramos los usuarios activos
      this.obtenerUsuariosActivos(); // Cargar usuarios activos
    } else {
      // Si no está activa, mostramos los usuarios eliminados
      this.obtenerUsuariosEliminados(); // Cargar usuarios eliminados
    }
    // Cambiar el valor de showDeletedTable para alternar entre activos y eliminados
    this.showDeletedTable = !this.showDeletedTable;
  }




  EditarUsuario(alumno: Usuario) {
    // console.log('ID del alumno:', alumno.idUsuario); //  ID del alumno

    if (!alumno.idUsuario) {
      console.error('ID del alumno es indefinido');
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Error',
          message: 'No se puede editar un alumno sin un ID.',
          type: 'error',
        },
      });
      return; // Salir si el ID no es válido
    }

    const dialogRef = this.dialog.open(DialogUsuarioComponent, {
      disableClose: true,
      data: alumno,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        const editarUsuario: Partial<Usuario> = {
          nombre: result.nombre,
          apellido: result.apellido,
          correo: result.correo,
          fechaNacimiento: result.fechaNacimiento,
          telefono: result.telefono,
          direccion: result.direccion,
        };

        try {
          await this.usuariosService.updateUserData(
            alumno.idUsuario,
            editarUsuario
          );
          console.log('Usuario editado correctamente', result);
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: 'Éxito',
              message: 'Datos editados correctamente.',
              type: 'info',
            },
          });
        } catch (error) {
          console.error('Error al editar el alumno:', error);
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: 'Error',
              message: 'No se pudo editar los datos del alumno.',
              type: 'error',
            },
          });
        }
      }
    });
  }

  AgregarUsuario() {
    const dialogRef = this.dialog.open(DialogUsuarioComponent, {
      data: {
        nombre: '',
        apellido: '',
        correo: '',
        fechaNacimiento: '',
        telefono: '',
        direccion: '',
        idTipoUsuario: 1, // O el valor que corresponda
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const nuevoUsuario: NuevoUsuario = {
          nombre: result.nombre,
          apellido: result.apellido,
          correo: result.correo,
          fechaNacimiento: result.fechaNacimiento,
          telefono: result.telefono,
          direccion: result.direccion,
          idTipoUsuario: 1,
          isDeleted: false,
          createdAt: new Date().toISOString(),
        };

        // Llama al servicio para agregar el usuario
        this.usuariosService.addUser(nuevoUsuario)
          .then(() => {
            // Solo se muestra el diálogo de éxito si la operación fue exitosa
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Éxito',
                message: 'El alumno ha sido agregado correctamente.',
                type: 'info',
              },
            });
          })
          .catch((error: Error) => {
            // Captura y muestra el error
            console.error('Error guardando datos: ', error.message);
            this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Error',
                message: error.message,
                type: 'error',
              },
            });
          });
      }
    });
  }



  EliminarUsuario(alumno: Usuario) {
    if (!alumno.idUsuario) {
      console.error('ID del alumno es indefinido');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Eliminación',
        message: '¿Estás seguro de que deseas eliminar este alumno?',
        type: 'confirm',
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.usuariosService.deleteUser(alumno.idUsuario);
          console.log('Usuario eliminado correctamente');
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: 'Éxito',
              message: 'El alumno ha sido eliminado correctamente.',
              type: 'info',
            },
          });
        } catch (error) {
          console.error('Error al eliminar el alumno:', error);
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: 'Error',
              message:
                'No se pudo eliminar al alumno. Inténtalo de nuevo más tarde.',
              type: 'error',
            },
          });
        }
      } else {
        console.log('No se eliminaron datos');
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Cancelar',
            message: 'No se realizó la acción.',
            type: 'info',
          },
        });
      }
    });
  }

  detalleUsuario(idUsuario: number) {
    this.router.navigate(['/alumno/', idUsuario]);
  }
}


