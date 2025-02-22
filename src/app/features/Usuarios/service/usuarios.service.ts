import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import firebase, { FirebaseError } from 'firebase/app';
import { NuevoUsuario, Usuario } from '../model/usuario.model';


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  obtenerUsuariosActivos(): Observable<Usuario[]> {
    // referencia a la colección usuarios
    const usuariosRef = collection(this.firestore, 'usuarios');

    // crea un nuevo Observable y suscribirse
    return new Observable<Usuario[]>((subscriber) => {
      // crea la consulta para obtener solo los usuarios no eliminados
      const obtenerUsuariosActivos = query(
        usuariosRef,
        where('isDeleted', '==', false)
      );

      // onSnapshot se usa para detectar los cambios en la colección usuarios
      const unsubscribe = onSnapshot(
        obtenerUsuariosActivos,
        (userSnapshots) => {
          // mapear el documento a un Array de Usuarios
          const users: Usuario[] = userSnapshots.docs.map((doc) => {
            // doc.data() devuelve los datos del documento en forma de objeto.
            const jsonUsuario = doc.data();

            // Cambia fechaNacimiento de Timestamp a Date
            if (jsonUsuario['fechaNacimiento'] instanceof Timestamp) {
              jsonUsuario['fechaNacimiento'] =
                jsonUsuario['fechaNacimiento'].toDate();
            }

            return {
              idUsuario: doc.id,
              ...jsonUsuario,
            } as Usuario;
          });
          // Emitir los usuarios actualizados
          subscriber.next(users);
        },
        (error) => {
          // Si ocurre un error en la operación de onSnapshot, se emite un error al subscriber
          subscriber.error(error);
        }
      );
      // Devolver la función de limpieza al desuscribirse
      return () => unsubscribe();
    });
  }

  obtenerUsuariosEliminados(): Observable<Usuario[]> {
    // referencia a la colección usuarios
    const usuariosRef = collection(this.firestore, 'usuarios');

    // crea un nuevo Observable y suscribirse
    return new Observable<Usuario[]>((subscriber) => {
      // crea la consulta para obtener solo los usuarios no eliminados
      const obtenerUsuariosActivos = query(
        usuariosRef,
        where('isDeleted', '==', true)
      );

      // onSnapshot se usa para detectar los cambios en la colección usuarios
      const unsubscribe = onSnapshot(
        obtenerUsuariosActivos,
        (userSnapshots) => {
          // mapear el documento a un Array de Usuarios
          const users: Usuario[] = userSnapshots.docs.map((doc) => {
            // doc.data() devuelve los datos del documento en forma de objeto.
            const jsonUsuario = doc.data();

            // Cambia fechaNacimiento de Timestamp a Date
            if (jsonUsuario['fechaNacimiento'] instanceof Timestamp) {
              jsonUsuario['fechaNacimiento'] =
                jsonUsuario['fechaNacimiento'].toDate();
            }

            return {
              idUsuario: doc.id,
              ...jsonUsuario,
            } as Usuario;
          });
          // Emitir los usuarios actualizados
          subscriber.next(users);
        },
        (error) => {
          // Si ocurre un error en la operación de onSnapshot, se emite un error al subscriber
          subscriber.error(error);
        }
      );
      // Devolver la función de limpieza al desuscribirse
      return () => unsubscribe();
    });
  }


  async getUser(idUsuario: string): Promise<Usuario | null> {
    try {
      const document = doc(this.firestore, `usuarios/${idUsuario}`);
      const snapshot = await getDoc(document);
      // console.log('datos del Usuario:', snapshot.data());

      return snapshot.data() as Usuario | null; // Devolver Usuario o null
    } catch (error) {
      console.error('No se encontró el usuario', error);
      return null; // en caso de error, retornar null
    }
  }
  //Recuperar usuarios eliminados
  async getUsersDeleted() {
    const querySnapshot = await getDocs(
      query(
        collection(this.firestore, 'usuarios'),
        where('isDeleted', '==', true)
      )
    );
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return users;
  }

  async updateUserData(
    idUsuario: string,
    editarUsuario: Partial<Usuario>
  ): Promise<void> {
    const userRef = doc(this.firestore, `usuarios/${idUsuario}`);
    // console.log('ID del Usuario:', idUsuario);
    await updateDoc(userRef, editarUsuario);
  }

  async deleteUser(uid: string) {
    const userRef = doc(this.firestore, `usuarios/${uid}`);

    // Asegúrate de que uid es una cadena válida antes de intentar actualizar
    await updateDoc(userRef, {
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    });
  }

//   async deleteUser(userId: string) {
//     const userRef = doc(this.firestore, `usuarios/${userId}`);

//     // Actualiza isDeleted a true
//     return setDoc(userRef, { isDeleted: true }, { merge: true });
// }


  async addUser(nuevoUsuario: NuevoUsuario): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        nuevoUsuario.correo,
        nuevoUsuario.apellido + 'Temporal'
      );

      const uid = userCredential.user.uid;
      const userRef = doc(this.firestore, `usuarios/${uid}`);

      await setDoc(userRef, {
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        correo: nuevoUsuario.correo,
        fechaNacimiento: nuevoUsuario.fechaNacimiento,
        telefono: nuevoUsuario.telefono,
        direccion: nuevoUsuario.direccion,
        idTipoUsuario: nuevoUsuario.idTipoUsuario,
        isDeleted: nuevoUsuario.isDeleted,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        // Lanza un error con un mensaje para que el componente lo capture
        throw new Error(this.handleError(error));
      } else {
        console.error('Error desconocido:', error);
        throw new Error('Error desconocido al crear el usuario.');
      }
    }
  }

  //errores de firebase
  private handleError(error: firebase.FirebaseError): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya está en uso. Por favor, utiliza otro.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico es inválido.';
      case 'auth/operation-not-allowed':
        return 'La operación no está permitida.';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres.';
      default:
        return 'Error al crear el usuario: ' + error.message;
    }
  }
}
