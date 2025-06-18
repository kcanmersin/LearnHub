using Microsoft.EntityFrameworkCore.Storage;
using LearnHub.Domain.Entities;
using LearnHub.Domain.Interfaces;
using LearnHub.Infrastructure.Data;

namespace LearnHub.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly LearnHubDbContext _context;
    private IDbContextTransaction? _transaction;
    private IRepository<User>? _users;
    private IRepository<VocabularyEntry>? _vocabularyEntries;

    public UnitOfWork(LearnHubDbContext context)
    {
        _context = context;
    }

    public IRepository<User> Users => _users ??= new Repository<User>(_context);

    public IRepository<VocabularyEntry> VocabularyEntries => 
        _vocabularyEntries ??= new Repository<VocabularyEntry>(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}