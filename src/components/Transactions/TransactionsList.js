import styled from 'styled-components';
import dayjs from 'dayjs';
import { useHistory } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import UserContext from '../../contexts/UserContext.js';
import { getTransactions } from '../../services/mywallet.js';
import { ErrorAlert } from '../SweetAlerts.js';

export default function TransactionsList () {
    const { user } = useContext(UserContext);
    const [transactions, setTransactions] = useState(null);
    const [total, setTotal] = useState(0);
    const history = useHistory();

    useEffect(() => {
        if (!user) return history.push('/signin');

        getTransactions(user?.token)
            .then((response) => {
                setTransactions(response.data);

                let sum = 0;
                response.data.forEach((transaction) => {
                    const value = Number(transaction.value.replace(/['R$ '.]+/g,"").replace(',','.'));
                    if (transaction.type === 'income') {
                            sum += value;
                    } else {
                            sum -= value;
                    }
                });
                setTotal(sum);
            })
            .catch((error) => {
                const errorStatus = error.response?.status;
                if (errorStatus === 401) {
                    ErrorAlert('Sessão inválida! Entre novamente.');
                    return history.push('/signin');
                };
                if (errorStatus === 500) return ErrorAlert('Erro desconhecido! Tente novamente');
                if (!errorStatus) return ErrorAlert('Servidor offline');
            });
    }, []);

    return (
        <TransactionsBox>
            {transactions?.length === 0 ? <NoTransactions /> : (
                <>
                    <List>
                        {transactions?.map((transaction, index) => (
                            <Transaction key={index}>
                                <div>
                                    <Day>{dayjs(transaction.date).format('DD/MM')}</Day>
                                    <Description>{transaction.description}</Description>
                                </div>
                                <Value type={transaction.type}>
                                    {Number(transaction.value).toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})}
                                </Value>
                            </Transaction>
                            )
                        )}
                    </List>
                    <TotalRow>
                            SALDO
                            <Value positive={total >= 0}>{Math.abs(total).toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})}</Value>
                    </TotalRow>
                </>
            )}
        </TransactionsBox>
    );
}

function NoTransactions () {
    return (
        <NoTransactionsMessage>
            Não há registros de entrada ou saída
        </NoTransactionsMessage>
    );
}

const TransactionsBox = styled.div`
    width: 100%;
    height: calc(100% - 175px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #ffffff;
    border-radius: 5px;
    margin-bottom: 13px;
    padding: 23px 12px 10px;
`;

const Transaction = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    padding-right: 5px;
`;

const Day = styled.span`
    color: #C6C6C6;
    font-size: 16px;
    margin-right: 5px;
`;

const Description = styled.span`
    font-size: 16px;
`;

const Value = styled.div`
    font-size: 16px;
    color: ${({ type, positive }) => type === 'income' || positive ? '#039B00' : '#C70000'};
`;

const List = styled.div`
    overflow-y: scroll;
    position: relative;

    ::-webkit-scrollbar {
        width: 5px;
    }

    ::-webkit-scrollbar-thumb {
        background-color: rgba(119, 119, 119, 0.3);
        border-radius: 5px;
    }
`;

const TotalRow = styled(Transaction)`
    font-weight: 700;
    margin-top: 5px;
    margin-bottom: 0px;
`;

const NoTransactionsMessage = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 20px;
    color: #868686;
    padding: 0 10%;
`;