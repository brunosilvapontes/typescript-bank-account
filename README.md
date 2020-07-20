# typescript-bank-account

Este projeto simula algumas operações de um banco. A conta a ser debitada e a conta a ser creditada foram criadas previamente e estão fixas no código. Os bancos de dados, Redis e MongoDB, estão hospedados na nuvem. 

## Executando os testes automatizados da API:

É necessário ter o Node.js versão 13+ instalado no computador.

É necessário criar uma pasta vazia e fazer um git clone do projeto na mesma.

Dentro da pasta criada pelo git clone, entrar na pasta server pelo Terminal e instalar os pacotes necessários, executando o seguinte comando:
```
$ yarn install
```

É necessário ter um arquivo com nome .env contendo as variáveis de ambiente dentro da pasta server.

Nesta mesma pasta, executar o seguinte comando no Terminal:

```
$ yarn test
``` 

## Rodando a aplicação usando docker

É necessário ter o docker e o docker-compose instalados no computador. 

Acessar a pasta raiz do projeto pelo Terminal e digitar:

```
$ docker-compose up
```

Após alguns minutos a aplicação estará pronta e poderá ser acessada pelo navegador no endereço http://localhost:3000/

OBS: O front-end está programado para usar a porta 3000 e o back-end usará a porta 3333, lembre-se de não ter nenhuma outra aplicação usando estas portas.

