/**
 * ARKA CLIENT ACTIONS - Composants pour modification et suppression
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Save, X } from 'lucide-react';

interface ClientDetails {
  id: string;
  nom: string;
  secteur: string;
  taille: string;
  contact_principal: {
    nom: string;
    email: string;
    fonction?: string;
    telephone?: string;
  };
  contexte_specifique: string;
  statut: string;
}

interface ClientActionsProps {
  client: ClientDetails;
  onClientUpdated: (updatedClient: ClientDetails) => void;
}

export function ClientActions({ client, onClientUpdated }: ClientActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // État pour les données d'édition
  const [editData, setEditData] = useState({
    nom: client.nom,
    secteur: client.secteur,
    taille: client.taille,
    contact_principal: {
      nom: client.contact_principal.nom,
      email: client.contact_principal.email,
      fonction: client.contact_principal.fonction || '',
      telephone: client.contact_principal.telephone || ''
    },
    contexte_specifique: client.contexte_specifique,
    statut: client.statut
  });

  // Sauvegarder les modifications
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/clients?id=${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification');
      }

      const updatedClient = await response.json();
      
      // Mettre à jour le client dans le composant parent
      onClientUpdated({
        ...client,
        ...editData
      } as ClientDetails);
      
      setIsEditing(false);
      setError(null);
      
    } catch (error) {
      console.error('Erreur modification client:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer le client
  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le client "${client.nom}" ?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/clients?id=${client.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      const result = await response.json();
      
      // Rediriger vers la liste
      router.push('/cockpit/admin/clients');
      
    } catch (error) {
      console.error('Erreur suppression client:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
      setIsDeleting(false);
    }
  };

  // Annuler les modifications
  const handleCancel = () => {
    setEditData({
      nom: client.nom,
      secteur: client.secteur,
      taille: client.taille,
      contact_principal: {
        nom: client.contact_principal.nom,
        email: client.contact_principal.email,
        fonction: client.contact_principal.fonction || '',
        telephone: client.contact_principal.telephone || ''
      },
      contexte_specifique: client.contexte_specifique,
      statut: client.statut
    });
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="flex gap-2">
      {/* Messages d'erreur */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-900 border border-red-700 text-red-100 px-4 py-2 rounded-lg z-50">
          {error}
        </div>
      )}
      
      {/* Boutons d'action */}
      {!isEditing ? (
        <>
          {/* Bouton Modifier */}
          <button
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
          
          {/* Bouton Supprimer */}
          <button
            onClick={() => setIsDeleting(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer
          </button>
        </>
      ) : (
        <>
          {/* Bouton Sauvegarder */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          
          {/* Bouton Annuler */}
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        </>
      )}
      
      {/* Modal de confirmation de suppression */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Confirmer la suppression</h3>
            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer le client <strong>"{client.nom}"</strong> ?
              <br />
              <span className="text-sm text-yellow-400 mt-2 block">
                Cette action ne peut pas être annulée.
              </span>
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleting(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Formulaire d'édition (sera intégré dans la page) */}
      {isEditing && (
        <EditForm 
          editData={editData} 
          setEditData={setEditData}
        />
      )}
    </div>
  );
}

// Composant de formulaire d'édition
interface EditFormProps {
  editData: any;
  setEditData: (data: any) => void;
}

function EditForm({ editData, setEditData }: EditFormProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-white mb-6">Modifier le client</h3>
        
        <div className="space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nom du client *
            </label>
            <input
              type="text"
              value={editData.nom}
              onChange={(e) => setEditData({...editData, nom: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          {/* Secteur */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Secteur d'activité *
            </label>
            <input
              type="text"
              value={editData.secteur}
              onChange={(e) => setEditData({...editData, secteur: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          {/* Taille */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Taille de l'entreprise
            </label>
            <select
              value={editData.taille}
              onChange={(e) => setEditData({...editData, taille: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="TPE">TPE (Très Petite Entreprise)</option>
              <option value="PME">PME (Petite et Moyenne Entreprise)</option>
              <option value="ETI">ETI (Entreprise de Taille Intermédiaire)</option>
              <option value="GE">GE (Grande Entreprise)</option>
            </select>
          </div>
          
          {/* Contact principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom du contact *
              </label>
              <input
                type="text"
                value={editData.contact_principal.nom}
                onChange={(e) => setEditData({
                  ...editData, 
                  contact_principal: {...editData.contact_principal, nom: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={editData.contact_principal.email}
                onChange={(e) => setEditData({
                  ...editData, 
                  contact_principal: {...editData.contact_principal, email: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Fonction
              </label>
              <input
                type="text"
                value={editData.contact_principal.fonction}
                onChange={(e) => setEditData({
                  ...editData, 
                  contact_principal: {...editData.contact_principal, fonction: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={editData.contact_principal.telephone}
                onChange={(e) => setEditData({
                  ...editData, 
                  contact_principal: {...editData.contact_principal, telephone: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Contexte spécifique */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Contexte spécifique
            </label>
            <textarea
              value={editData.contexte_specifique}
              onChange={(e) => setEditData({...editData, contexte_specifique: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Informations supplémentaires sur le client..."
            />
          </div>
          
          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Statut
            </label>
            <select
              value={editData.statut}
              onChange={(e) => setEditData({...editData, statut: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}