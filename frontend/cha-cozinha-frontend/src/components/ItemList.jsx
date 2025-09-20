import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Gift, Search, Heart, AlertTriangle } from 'lucide-react';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showMyGifts, setShowMyGifts] = useState(false);
  const [myGiftsName, setMyGiftsName] = useState('');
  const [myGifts, setMyGifts] = useState([]);
  
  // Estados para o pop-up de confirmação
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToConfirm, setItemToConfirm] = useState(null);
  const [confirmerName, setConfirmerName] = useState('');

  // Buscar itens da API
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
  const response = await fetch('https://cha-panela.up.railway.app/api/items');      
  const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (item, checked) => {
    if (checked && !item.escolhido) {
      // Se está marcando o checkbox e o item não foi escolhido, abrir confirmação
      setItemToConfirm(item);
      setShowConfirmation(true);
    }
    // Se está desmarcando ou o item já foi escolhido, não faz nada
    // (a escolha é irreversível)
  };

  const confirmChoice = async () => {
    if (!confirmerName.trim()) {
      alert('Por favor, digite seu nome');
      return;
    }

    try {
      const response = await fetch(`https://cha-panela.up.railway.app/api/items/${itemToConfirm.id}/escolher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome_pessoa: confirmerName.trim() }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setItems(items.map(item => 
          item.id === itemToConfirm.id ? updatedItem : item
        ));
        
        // Fechar o modal e limpar estados
        setShowConfirmation(false);
        setItemToConfirm(null);
        setConfirmerName('');
        
        // Mostrar mensagem de confirmação
        alert(`Obrigado! Você escolheu: ${updatedItem.nome}\n\nEsta escolha é irreversível. Para lembrar do que escolheu, use o botão "Lembrar do que escolhi".`);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao escolher item');
      }
    } catch (error) {
      console.error('Erro ao escolher item:', error);
      alert('Erro ao escolher item');
    }
  };

  const cancelChoice = () => {
    setShowConfirmation(false);
    setItemToConfirm(null);
    setConfirmerName('');
  };

  const searchMyGifts = async () => {
    if (!myGiftsName.trim()) {
      alert('Por favor, digite seu nome');
      return;
    }

    try {
     const response = await fetch('https://cha-panela.up.railway.app/api/items/meus-presentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome_pessoa: myGiftsName.trim() }),
      });

      if (response.ok) {
        const gifts = await response.json();
        setMyGifts(gifts);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao buscar seus presentes');
      }
    } catch (error) {
      console.error('Erro ao buscar presentes:', error);
      alert('Erro ao buscar seus presentes');
    }
  };

  const categories = ['Todos', ...new Set(items.map(item => item.categoria))];
  const filteredItems = selectedCategory === 'Todos' 
    ? items 
    : items.filter(item => item.categoria === selectedCategory);

  const availableItems = filteredItems.filter(item => !item.escolhido);
  const chosenItems = filteredItems.filter(item => item.escolhido);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Gift className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-lg text-muted-foreground">Carregando lista de presentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Lista de Presentes</h1>
          </div>
          <p className="text-2xl text-primary font-semibold mb-2">Marina & Henrique</p>
          <p className="text-lg text-muted-foreground">Chá de Panela</p>
          <p className="text-sm text-muted-foreground mt-2">
            Marque o checkbox do presente que deseja escolher. 
            <strong> Atenção: após confirmar, a escolha não poderá ser alterada!</strong>
          </p>
        </div>

        {/* Botão para lembrar do que escolheu */}
        <div className="mb-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowMyGifts(true)}
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Lembrar do que escolhi
          </Button>
        </div>

        {/* Filtros por categoria */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{filteredItems.length}</div>
              <div className="text-sm text-muted-foreground">Total de Itens</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{chosenItems.length}</div>
              <div className="text-sm text-muted-foreground">Já Escolhidos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{availableItems.length}</div>
              <div className="text-sm text-muted-foreground">Disponíveis</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de itens disponíveis */}
        {availableItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Itens Disponíveis ({availableItems.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableItems.map(item => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight">{item.nome}</CardTitle>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {item.categoria}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.escolhido}
                        onCheckedChange={(checked) => handleCheckboxChange(item, checked)}
                        disabled={item.escolhido}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <label 
                        htmlFor={`item-${item.id}`} 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {item.escolhido ? 'Já escolhido' : 'Escolher este presente'}
                      </label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Lista de itens já escolhidos */}
        {chosenItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Itens Já Escolhidos ({chosenItems.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chosenItems.map(item => (
                <Card key={item.id} className="opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg leading-tight text-muted-foreground">
                        {item.nome}
                      </CardTitle>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {item.categoria}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={true}
                        disabled={true}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Já escolhido</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Modal de confirmação */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  <CardTitle>Confirmar Escolha</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Você está escolhendo: <strong>{itemToConfirm?.nome}</strong>
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-amber-800 font-medium">
                    ⚠️ ATENÇÃO: Esta escolha é irreversível!
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Após confirmar, você não poderá mudar de ideia ou escolher outro presente.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Seu nome:</label>
                  <Input
                    value={confirmerName}
                    onChange={(e) => setConfirmerName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="mt-1"
                    onKeyPress={(e) => e.key === 'Enter' && confirmChoice()}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Seu nome será usado apenas para você lembrar do que escolheu
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={confirmChoice}
                    disabled={!confirmerName.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Sim, confirmo minha escolha
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={cancelChoice}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal para lembrar do que escolheu */}
        {showMyGifts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Lembrar do que escolhi</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Digite seu nome para ver os presentes que você escolheu
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Seu nome:</label>
                  <Input
                    value={myGiftsName}
                    onChange={(e) => setMyGiftsName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="mt-1"
                    onKeyPress={(e) => e.key === 'Enter' && searchMyGifts()}
                  />
                </div>
                <Button 
                  onClick={searchMyGifts}
                  disabled={!myGiftsName.trim()}
                  className="w-full"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Meus Presentes
                </Button>
                
                {myGifts.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Seus presentes escolhidos:</h3>
                    <div className="space-y-2">
                      {myGifts.map(gift => (
                        <div key={gift.id} className="p-2 bg-muted rounded-lg">
                          <p className="font-medium">{gift.nome}</p>
                          <p className="text-sm text-muted-foreground">{gift.categoria}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {myGifts.length === 0 && myGiftsName && (
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhum presente encontrado para este nome.
                  </p>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowMyGifts(false);
                    setMyGiftsName('');
                    setMyGifts([]);
                  }}
                  className="w-full"
                >
                  Fechar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemList;

