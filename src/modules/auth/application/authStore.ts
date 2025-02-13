import { createContext, useContext } from "react";
import { createStore, useStore } from "zustand";
import { ICredentials } from "../infrastructure/loginUser";
import { IUser } from "../types";
import { auth, db } from "shared/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const isLoggedIn = () => !!auth.currentUser;

interface IStore {
  isAuthenticated: boolean;
  isError: boolean;
  state: "idle" | "loading" | "finished";
  user: IUser;
  login: (credentials: ICredentials) => Promise<void>;
  logout: () => Promise<void>;
  signup: (credentials: ICredentials) => Promise<void>;
}

export type AuthStore = ReturnType<typeof initializeAuthStore>;

const zustandContext = createContext<AuthStore | null>(null);

export const Provider = zustandContext.Provider;

export const useAuthStore = <T>(selector: (state: IStore) => T) => {
  const store = useContext(zustandContext);

  if (!store) throw new Error("AuthStore is missing the provider");

  return useStore(store, selector);
};

export const initializeAuthStore = (preloadedState: Partial<IStore> = {}) => {
  return createStore<IStore>((set) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        set({
          user: user as unknown as IUser,
          isAuthenticated: true,
          state: "finished",
        });
      } else {
        set({
          isAuthenticated: false,
          state: "finished",
        });
      }
    });

    return {
      isAuthenticated: false,
      isError: false,
      state: isLoggedIn() ? "idle" : "finished",
      user: undefined as unknown as IUser,
      ...preloadedState,
      login: async (credentials: ICredentials) => {
        set({ state: "loading" });

        try {
          await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          const user = auth.currentUser;

          set({
            isAuthenticated: true,
            state: "finished",
            user: user as unknown as IUser,
          });
        } catch (e) {
          set({
            isAuthenticated: false,
            state: "finished",
            user: undefined,
          });

          throw e;
        }
      },
      logout: async () => {
        set({ state: "loading" });

        try {
          await signOut(auth);
          set({
            isAuthenticated: false,
            state: "finished",
            user: undefined,
          });
        } catch (e) {
          set({
            state: "finished",
          });

          throw e;
        }
      },
      signup: async (credentials: ICredentials) => {
        set({ state: "loading" });

        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          const user = userCredential.user;

          // Store tenant information in Firestore
          await setDoc(doc(db, "users", user.uid), {
            email: credentials.email,
          });

          set({
            isAuthenticated: true,
            state: "finished",
            user: user as unknown as IUser,
          });
        } catch (e) {
          set({
            isAuthenticated: false,
            state: "finished",
            user: undefined,
          });

          throw e;
        }
      },
    };
  });
};
