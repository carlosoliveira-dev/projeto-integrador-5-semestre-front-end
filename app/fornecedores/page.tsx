export default function Supplier() {
  return (
    <>
    <header>
        <h1>Cadastro de Fornecedor</h1>
    </header>

    <form action="/pagina-processa-dados-do-form" method="post">
    <div>
        <label htmlFor="nome_empresa">Nome da Empresa:</label>
        <input type="text" id="nome_empresa" placeholder="Insira o nome da empresa" required/>
    </div>
    <div>
        <label htmlFor="cnpj">CNPJ:</label>
        <input type="text" id="cnpj" placeholder="00.000.000/0000-00" required/>
    </div>
     <div>
        <label htmlFor="endereco">Endereço:</label>
        <input type="text" id="endereco" placeholder="Insira o endereço completo da empresa" required/>
    </div>
    <div>
        <label htmlFor="telefone">Telefone:</label>
        <input type="text" id="telefone" placeholder="(00) 00000-0000" required/>
    </div>
    <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" placeholder="exemplo@fornecedor.com" required/>
    </div>
    <div>
        <label htmlFor="contato">Contato Principal:</label>
        <input type="text" id="contato" placeholder="Nome do contato principal" required/>
    </div>
    <div className="button">
        <button type="submit">Cadastrar Fornecedor</button>
    </div>
    </form>
    </>
  )
}
