
export interface Usuario {
  idUsuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  fechaNacimiento: Date;
  telefono: string;
  direccion: string;

  // cursos: Cursos [];
  idTipoUsuario: number;
  isDeleted: boolean;
  createdAt: string;

  photoURL?: string;

}


export interface NuevoUsuario {
  nombre: string;
  apellido: string;
  correo: string;
  fechaNacimiento: Date;
  telefono: string;
  direccion: string;
  idTipoUsuario: number;
  isDeleted: boolean;
  createdAt: string;

  photoURL?: string;


}
